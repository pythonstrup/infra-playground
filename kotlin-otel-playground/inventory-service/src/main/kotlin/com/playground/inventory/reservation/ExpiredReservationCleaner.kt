package com.playground.inventory.reservation

import com.playground.inventory.ledger.LedgerReason
import com.playground.inventory.ledger.StockLedger
import com.playground.inventory.ledger.StockLedgerRepository
import com.playground.inventory.stock.StockRepository
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import java.time.Instant

/**
 * Periodically finds HELD reservations past their expiresAt and restores the held stock.
 * Runs every 60 seconds.
 */
@Component
class ExpiredReservationCleaner(
    private val reservationRepository: ReservationRepository,
    private val stockRepository: StockRepository,
    private val ledgerRepository: StockLedgerRepository,
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val transactionalOperator: TransactionalOperator,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    fun releaseExpiredReservations() = runBlocking {
        val expired = reservationRepository.findByStatusAndExpiresAtBefore(
            ReservationStatus.HELD, Instant.now()
        ).toList()

        if (expired.isEmpty()) return@runBlocking

        log.info("expired_reservations_found count={}", expired.size)

        expired.forEach { reservation ->
            transactionalOperator.executeAndAwait {
                val cancelledReservation = reservation.copy(status = ReservationStatus.CANCELLED)

                stockRepository.findByProductId(reservation.productId)?.let { stock ->
                    stockRepository.save(stock.copy(quantity = stock.quantity + reservation.quantity))
                    redisTemplate.delete("inventory:stock:${reservation.productId}").awaitSingle()
                }

                reservationRepository.save(cancelledReservation)

                ledgerRepository.save(
                    StockLedger(
                        productId = reservation.productId,
                        changeQuantity = reservation.quantity,
                        reason = LedgerReason.RESERVATION_CANCELLED,
                        referenceId = reservation.referenceId,
                    )
                )

                log.info(
                    "expired_reservation_released productId={} ref={} qty={}",
                    reservation.productId, reservation.referenceId, reservation.quantity
                )
            }
        }
    }
}
