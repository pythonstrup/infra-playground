package com.playground.fulfillment.shipment

import org.springframework.data.repository.kotlin.CoroutineCrudRepository

interface ShipmentRepository : CoroutineCrudRepository<Shipment, Long>
