package com.playground.inventory.reservation

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("inventory.reservations")
data class Reservation(
    @Id
    val id: Long? = null,
    val productId: Long,
    val quantity: Int,
    val referenceId: String,
    val status: ReservationStatus = ReservationStatus.HELD,
    val expiresAt: Instant,
    @CreatedDate
    val createdAt: Instant = Instant.now(),
)

enum class ReservationStatus {
    HELD, CONFIRMED, CANCELLED
}
