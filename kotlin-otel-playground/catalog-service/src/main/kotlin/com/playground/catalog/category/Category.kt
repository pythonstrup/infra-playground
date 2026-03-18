package com.playground.catalog.category

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("catalog.categories")
data class Category(
    @Id
    val id: Long? = null,
    val name: String,
    val parentId: Long? = null,
    @CreatedDate
    val createdAt: Instant = Instant.now(),
)
