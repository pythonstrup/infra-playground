package com.playground.fulfillment.shipment

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("fulfillment.shipments")
data class Shipment(
    @Id
    val id: Long? = null,
    val productId: Long,
    val quantity: Int,
    val status: ShipmentStatus = ShipmentStatus.CREATED,
    val trackingNumber: String? = null,
    val reservationRef: String? = null,
    @CreatedDate
    val createdAt: Instant = Instant.now(),
    @LastModifiedDate
    val updatedAt: Instant = Instant.now(),
)

enum class ShipmentStatus {
    CREATED, RESERVED, PICKING, PACKED, SHIPPED;

    /** Returns the next status in the workflow, or null if terminal. */
    fun next(): ShipmentStatus? = when (this) {
        CREATED -> RESERVED
        RESERVED -> PICKING
        PICKING -> PACKED
        PACKED -> SHIPPED
        SHIPPED -> null
    }
}
