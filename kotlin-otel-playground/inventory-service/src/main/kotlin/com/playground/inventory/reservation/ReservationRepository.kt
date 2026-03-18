package com.playground.inventory.reservation

import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import java.time.Instant

interface ReservationRepository : CoroutineCrudRepository<Reservation, Long> {

    suspend fun findByProductIdAndReferenceIdAndStatus(
        productId: Long,
        referenceId: String,
        status: ReservationStatus,
    ): Reservation?

    fun findByStatusAndExpiresAtBefore(
        status: ReservationStatus,
        expiresAt: Instant,
    ): Flow<Reservation>
}
