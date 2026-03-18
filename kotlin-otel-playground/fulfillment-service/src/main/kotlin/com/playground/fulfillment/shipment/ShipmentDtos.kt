package com.playground.fulfillment.shipment

import com.playground.fulfillment.event.ShipmentEvent
import jakarta.validation.constraints.Positive
import java.time.Instant

data class CreateShipmentRequest(
    @field:Positive val productId: Long,
    @field:Positive val quantity: Int,
)

data class ShipmentResponse(
    val id: Long,
    val productId: Long,
    val quantity: Int,
    val status: ShipmentStatus,
    val trackingNumber: String?,
    val reservationRef: String?,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(shipment: Shipment) = ShipmentResponse(
            id = shipment.id!!,
            productId = shipment.productId,
            quantity = shipment.quantity,
            status = shipment.status,
            trackingNumber = shipment.trackingNumber,
            reservationRef = shipment.reservationRef,
            createdAt = shipment.createdAt,
            updatedAt = shipment.updatedAt,
        )
    }
}

data class ShipmentDetailResponse(
    val shipment: ShipmentResponse,
    val events: List<ShipmentEventResponse>,
)

data class ShipmentEventResponse(
    val id: Long,
    val fromStatus: String?,
    val toStatus: String,
    val detail: String?,
    val createdAt: Instant,
) {
    companion object {
        fun from(event: ShipmentEvent) = ShipmentEventResponse(
            id = event.id!!,
            fromStatus = event.fromStatus,
            toStatus = event.toStatus,
            detail = event.detail,
            createdAt = event.createdAt,
        )
    }
}
