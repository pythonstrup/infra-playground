package com.playground.fulfillment.shipment

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.playground.fulfillment.client.InventoryClient
import com.playground.fulfillment.event.ShipmentEvent
import com.playground.fulfillment.event.ShipmentEventRepository
import com.playground.core.client.CatalogClient
import com.playground.core.exception.BusinessException
import com.playground.core.exception.EntityNotFoundException
import com.playground.core.exception.RateLimitExceededException
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class ShipmentService(
    private val shipmentRepository: ShipmentRepository,
    private val eventRepository: ShipmentEventRepository,
    private val catalogClient: CatalogClient,
    private val inventoryClient: InventoryClient,
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val STATUS_CACHE_PREFIX = "fulfillment:shipment:"
        private val STATUS_CACHE_TTL = Duration.ofSeconds(60)
        private const val RATE_LIMIT_PREFIX = "fulfillment:ratelimit:"
        private const val MAX_SHIPMENTS_PER_MINUTE = 30L
    }

    @Transactional
    suspend fun create(request: CreateShipmentRequest): ShipmentResponse {
        enforceRateLimit()
        catalogClient.verifyProductExists(request.productId)

        val reservation = inventoryClient.reserve(request.productId, request.quantity)

        return try {
            val shipment = shipmentRepository.save(
                Shipment(
                    productId = request.productId,
                    quantity = request.quantity,
                    status = ShipmentStatus.CREATED,
                )
            )

            recordEvent(shipment.id!!, null, ShipmentStatus.CREATED, "Shipment created")

            // Advance to RESERVED after successful inventory reservation
            val reservedShipment = shipmentRepository.save(
                shipment.copy(
                    status = ShipmentStatus.RESERVED,
                    reservationRef = reservation.referenceId,
                )
            )

            recordEvent(
                reservedShipment.id!!, ShipmentStatus.CREATED, ShipmentStatus.RESERVED,
                "Inventory reserved: ref=${reservation.referenceId}"
            )

            log.info("shipment_created id={} productId={} qty={}", reservedShipment.id, request.productId, request.quantity)
            ShipmentResponse.from(reservedShipment)
        } catch (ex: Exception) {
            log.error("shipment_creation_failed, compensating reservation ref={}", reservation.referenceId, ex)
            inventoryClient.cancel(request.productId, reservation.referenceId)
            throw ex
        }
    }

    suspend fun getDetail(id: Long): ShipmentDetailResponse {
        val shipment = findShipmentOrThrow(id)
        val events = eventRepository.findByShipmentIdOrderByCreatedAtAsc(id)
            .map(ShipmentEventResponse::from)
            .toList()

        return ShipmentDetailResponse(
            shipment = ShipmentResponse.from(shipment),
            events = events,
        )
    }

    suspend fun getTrackingStatus(id: Long): ShipmentResponse =
        cachedOrLoad("$STATUS_CACHE_PREFIX$id", STATUS_CACHE_TTL) {
            findShipmentOrThrow(id).let(ShipmentResponse::from)
        }

    @Transactional
    suspend fun advance(id: Long): ShipmentResponse {
        val shipment = findShipmentOrThrow(id)
        val previousStatus = shipment.status

        val nextStatus = shipment.status.next()
            ?: throw BusinessException("Shipment $id is already in terminal state: ${shipment.status}")

        // State-specific side effects
        when (nextStatus) {
            ShipmentStatus.PICKING -> {
                shipment.reservationRef?.let { ref ->
                    inventoryClient.confirm(shipment.productId, ref)
                }
            }
            else -> { /* no side effects */ }
        }

        val updatedShipment = shipmentRepository.save(
            shipment.copy(
                status = nextStatus,
                trackingNumber = if (nextStatus == ShipmentStatus.SHIPPED) generateTrackingNumber() else shipment.trackingNumber,
            )
        )

        recordEvent(updatedShipment.id!!, previousStatus, nextStatus, "Advanced to $nextStatus")
        invalidateStatusCache(id)

        log.info("shipment_advanced id={} from={} to={}", id, previousStatus, nextStatus)
        return ShipmentResponse.from(updatedShipment)
    }

    // --- Private helpers ---

    private suspend fun findShipmentOrThrow(id: Long): Shipment =
        shipmentRepository.findById(id)
            ?: throw EntityNotFoundException("Shipment not found: $id")

    private suspend fun recordEvent(
        shipmentId: Long,
        from: ShipmentStatus?,
        to: ShipmentStatus,
        detail: String?,
    ) {
        eventRepository.save(
            ShipmentEvent(
                shipmentId = shipmentId,
                fromStatus = from?.name,
                toStatus = to.name,
                detail = detail,
            )
        )
    }

    private fun generateTrackingNumber(): String =
        "TRK-${UUID.randomUUID().toString().take(8).uppercase()}"

    private suspend fun invalidateStatusCache(shipmentId: Long) {
        redisTemplate.delete("$STATUS_CACHE_PREFIX$shipmentId").awaitSingle()
    }

    /** Inline + reified generic caching: checks Redis first, calls [loader] on miss. */
    private suspend inline fun <reified T> cachedOrLoad(key: String, ttl: Duration, crossinline loader: suspend () -> T): T {
        redisTemplate.opsForValue().get(key).awaitSingleOrNull()?.let { cached ->
            log.debug("cache_hit key={}", key)
            return objectMapper.readValue<T>(cached)
        }
        return loader().also { value ->
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value), ttl).awaitSingle()
            log.debug("cache_miss key={}", key)
        }
    }

    /**
     * Sliding-window rate limiter using atomic INCR + conditional EXPIRE.
     * INCR creates the key with value 1 if absent, so TTL is set only on the first call per window.
     */
    private suspend fun enforceRateLimit() {
        val windowKey = "$RATE_LIMIT_PREFIX${Instant.now().epochSecond / 60}"
        val count = redisTemplate.opsForValue().increment(windowKey).awaitSingle()

        if (count == 1L) {
            redisTemplate.expire(windowKey, Duration.ofSeconds(65)).awaitSingle()
        }

        if (count > MAX_SHIPMENTS_PER_MINUTE) {
            throw RateLimitExceededException("Shipment creation rate limit exceeded: $MAX_SHIPMENTS_PER_MINUTE/min")
        }
    }
}
