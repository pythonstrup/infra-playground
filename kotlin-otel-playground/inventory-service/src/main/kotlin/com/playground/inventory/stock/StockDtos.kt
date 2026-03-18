package com.playground.inventory.stock

import com.playground.inventory.ledger.StockLedger
import com.playground.inventory.reservation.Reservation
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import java.time.Instant

data class ReserveRequest(
    @field:Positive val quantity: Int,
    val referenceId: String? = null,
) {
    /** Ensures referenceId is either null (auto-generated) or non-blank. */
    fun sanitizedReferenceId(): String? = referenceId?.ifBlank { null }
}

data class ConfirmRequest(
    @field:NotBlank val referenceId: String,
)

data class CancelRequest(
    @field:NotBlank val referenceId: String,
)

data class RestockRequest(
    @field:Positive val quantity: Int,
)

data class StockResponse(
    val productId: Long,
    val quantity: Int,
) {
    companion object {
        fun from(stock: Stock) = StockResponse(
            productId = stock.productId,
            quantity = stock.quantity,
        )
    }
}

data class ReservationResponse(
    val reservationId: Long,
    val productId: Long,
    val quantity: Int,
    val referenceId: String,
    val status: String,
) {
    companion object {
        fun from(reservation: Reservation) = ReservationResponse(
            reservationId = reservation.id!!,
            productId = reservation.productId,
            quantity = reservation.quantity,
            referenceId = reservation.referenceId,
            status = reservation.status.name,
        )
    }
}

data class StockLedgerResponse(
    val id: Long,
    val productId: Long,
    val changeQuantity: Int,
    val reason: String,
    val referenceId: String?,
    val createdAt: Instant,
) {
    companion object {
        fun from(ledger: StockLedger) = StockLedgerResponse(
            id = ledger.id!!,
            productId = ledger.productId,
            changeQuantity = ledger.changeQuantity,
            reason = ledger.reason.name,
            referenceId = ledger.referenceId,
            createdAt = ledger.createdAt,
        )
    }
}
