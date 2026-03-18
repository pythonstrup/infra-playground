package com.playground.fulfillment.event

import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository

interface ShipmentEventRepository : CoroutineCrudRepository<ShipmentEvent, Long> {
    fun findByShipmentIdOrderByCreatedAtAsc(shipmentId: Long): Flow<ShipmentEvent>
}
