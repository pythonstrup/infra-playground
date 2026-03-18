package com.playground.fulfillment.event

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("fulfillment.shipment_events")
data class ShipmentEvent(
    @Id
    val id: Long? = null,
    val shipmentId: Long,
    val fromStatus: String? = null,
    val toStatus: String,
    val detail: String? = null,
    @CreatedDate
    val createdAt: Instant = Instant.now(),
)
