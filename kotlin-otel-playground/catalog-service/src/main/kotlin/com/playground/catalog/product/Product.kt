package com.playground.catalog.product

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("catalog.products")
data class Product(
    @Id
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    val sku: String,
    val categoryId: Long? = null,
    val weightGrams: Int? = null,
    @CreatedDate
    val createdAt: Instant = Instant.now(),
    @LastModifiedDate
    val updatedAt: Instant = Instant.now(),
)
