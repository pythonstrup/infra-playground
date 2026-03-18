package com.playground.inventory.stock

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("inventory.stocks")
data class Stock(
    @Id
    val id: Long? = null,
    val productId: Long,
    val quantity: Int,
    val warehouseZone: String? = null,
    @LastModifiedDate
    val updatedAt: Instant = Instant.now(),
)
