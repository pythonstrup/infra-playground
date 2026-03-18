package com.playground.inventory.stock

import com.fasterxml.jackson.databind.ObjectMapper
import com.playground.inventory.ledger.LedgerReason
import com.playground.inventory.ledger.StockLedger
import com.playground.inventory.ledger.StockLedgerRepository
import com.playground.inventory.reservation.Reservation
import com.playground.inventory.reservation.ReservationRepository
import com.playground.inventory.reservation.ReservationStatus
import com.playground.core.client.CatalogClient
import com.playground.core.exception.BusinessException
import com.playground.core.exception.EntityNotFoundException
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.data.redis.core.script.DefaultRedisScript
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class StockService(
    private val stockRepository: StockRepository,
    private val reservationRepository: ReservationRepository,
    private val ledgerRepository: StockLedgerRepository,
    private val catalogClient: CatalogClient,
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val LOCK_PREFIX = "inventory:lock:"
        private const val STOCK_CACHE_PREFIX = "inventory:stock:"
        private val LOCK_TTL = Duration.ofSeconds(10)
        private val STOCK_CACHE_TTL = Duration.ofSeconds(30)
        private const val LOW_STOCK_THRESHOLD = 10

        /** Atomic compare-and-delete Lua script for safe lock release. */
        private val UNLOCK_SCRIPT = DefaultRedisScript<Long>().apply {
            setScriptText(
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) " +
                    "else return 0 end"
            )
            resultType = Long::class.java
        }
    }

    suspend fun getStock(productId: Long): StockResponse =
        redisTemplate.opsForValue().get("$STOCK_CACHE_PREFIX$productId").awaitSingleOrNull()
            ?.let { StockResponse(productId = productId, quantity = it.toInt()) }
            ?.also { log.debug("stock_cache_hit productId={}", productId) }
            ?: findStockOrThrow(productId)
                .let(StockResponse::from)
                .also { cacheStock(it) }

    @Transactional
    suspend fun reserve(productId: Long, request: ReserveRequest): ReservationResponse {
        catalogClient.verifyProductExists(productId)

        return withDistributedLock(productId) {
            val stock = findStockOrThrow(productId)

            if (stock.quantity < request.quantity) {
                throw BusinessException(
                    "Insufficient stock for product $productId: available=${stock.quantity}, requested=${request.quantity}"
                )
            }

            val updatedStock = stockRepository.save(
                stock.copy(quantity = stock.quantity - request.quantity)
            )

            val referenceId = request.sanitizedReferenceId() ?: UUID.randomUUID().toString()
            val reservation = reservationRepository.save(
                Reservation(
                    productId = productId,
                    quantity = request.quantity,
                    referenceId = referenceId,
                    expiresAt = Instant.now().plus(Duration.ofMinutes(15)),
                )
            )

            recordLedger(productId, -request.quantity, LedgerReason.RESERVATION, referenceId)
            invalidateStockCache(productId)

            updatedStock.quantity
                .takeIf { it < LOW_STOCK_THRESHOLD }
                ?.also { remaining ->
                    redisTemplate.convertAndSend("stock.low", "$productId:$remaining").awaitSingle()
                    log.warn("low_stock_alert productId={} remaining={}", productId, remaining)
                }

            log.info("stock_reserved productId={} qty={} ref={}", productId, request.quantity, referenceId)
            ReservationResponse.from(reservation)
        }
    }

    @Transactional
    suspend fun confirm(productId: Long, request: ConfirmRequest): ReservationResponse =
        withDistributedLock(productId) {
            val reservation = findHeldReservation(productId, request.referenceId)
            val confirmedReservation = reservationRepository.save(
                reservation.copy(status = ReservationStatus.CONFIRMED)
            )

            recordLedger(productId, 0, LedgerReason.RESERVATION_CONFIRMED, request.referenceId)
            log.info("reservation_confirmed productId={} ref={}", productId, request.referenceId)

            ReservationResponse.from(confirmedReservation)
        }

    @Transactional
    suspend fun cancel(productId: Long, request: CancelRequest): ReservationResponse =
        withDistributedLock(productId) {
            val reservation = findHeldReservation(productId, request.referenceId)
            val cancelledReservation = reservationRepository.save(
                reservation.copy(status = ReservationStatus.CANCELLED)
            )

            val stock = findStockOrThrow(productId)
            stockRepository.save(stock.copy(quantity = stock.quantity + reservation.quantity))

            recordLedger(productId, reservation.quantity, LedgerReason.RESERVATION_CANCELLED, request.referenceId)
            invalidateStockCache(productId)
            log.info("reservation_cancelled productId={} ref={} restored={}", productId, request.referenceId, reservation.quantity)

            ReservationResponse.from(cancelledReservation)
        }

    @Transactional
    suspend fun restock(productId: Long, request: RestockRequest): StockResponse {
        catalogClient.verifyProductExists(productId)

        return withDistributedLock(productId) {
            val existing = stockRepository.findByProductId(productId)
            val stock = if (existing != null) {
                stockRepository.save(existing.copy(quantity = existing.quantity + request.quantity))
            } else {
                stockRepository.save(Stock(productId = productId, quantity = request.quantity))
            }

            recordLedger(productId, request.quantity, LedgerReason.RESTOCK)
            invalidateStockCache(productId)
            log.info("restocked productId={} added={} total={}", productId, request.quantity, stock.quantity)

            StockResponse.from(stock)
        }
    }

    suspend fun getLedger(productId: Long): List<StockLedgerResponse> =
        ledgerRepository.findByProductIdOrderByCreatedAtDesc(productId)
            .map(StockLedgerResponse::from)
            .toList()

    // --- Private helpers ---

    private suspend fun findStockOrThrow(productId: Long): Stock =
        stockRepository.findByProductId(productId)
            ?: throw EntityNotFoundException("Stock not found for product: $productId")

    private suspend fun findHeldReservation(productId: Long, referenceId: String): Reservation =
        reservationRepository.findByProductIdAndReferenceIdAndStatus(
            productId, referenceId, ReservationStatus.HELD
        ) ?: throw EntityNotFoundException(
            "Active reservation not found: productId=$productId, ref=$referenceId"
        )

    private suspend fun recordLedger(
        productId: Long,
        changeQty: Int,
        reason: LedgerReason,
        referenceId: String? = null,
    ) {
        ledgerRepository.save(
            StockLedger(
                productId = productId,
                changeQuantity = changeQty,
                reason = reason,
                referenceId = referenceId,
            )
        )
    }

    private suspend fun cacheStock(response: StockResponse) {
        redisTemplate.opsForValue()
            .set("$STOCK_CACHE_PREFIX${response.productId}", response.quantity.toString(), STOCK_CACHE_TTL)
            .awaitSingle()
    }

    private suspend fun invalidateStockCache(productId: Long) {
        redisTemplate.delete("$STOCK_CACHE_PREFIX$productId").awaitSingle()
    }

    /**
     * Executes [action] while holding a Redis distributed lock for the given product.
     * Uses atomic Lua script for lock release to prevent TOCTOU race conditions.
     */
    private suspend fun <T> withDistributedLock(productId: Long, action: suspend () -> T): T {
        val lockKey = "$LOCK_PREFIX$productId"
        val lockValue = UUID.randomUUID().toString()

        val acquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, lockValue, LOCK_TTL)
            .awaitSingleOrNull() ?: false

        if (!acquired) {
            throw BusinessException("Could not acquire lock for product: $productId")
        }

        return try {
            action()
        } finally {
            redisTemplate.execute(UNLOCK_SCRIPT, listOf(lockKey), listOf(lockValue))
                .awaitFirstOrNull()
        }
    }
}
