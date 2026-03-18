package com.playground.catalog.product

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.Instant

data class CreateProductRequest(
    @field:NotBlank
    @field:Size(max = 255)
    val name: String,

    @field:Size(max = 2000)
    val description: String? = null,

    @field:NotBlank
    @field:Size(max = 100)
    val sku: String,

    val categoryId: Long? = null,

    @field:Positive
    val weightGrams: Int? = null,
)

data class ProductResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val sku: String,
    val categoryId: Long?,
    val weightGrams: Int?,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(product: Product) = ProductResponse(
            id = product.id!!,
            name = product.name,
            description = product.description,
            sku = product.sku,
            categoryId = product.categoryId,
            weightGrams = product.weightGrams,
            createdAt = product.createdAt,
            updatedAt = product.updatedAt,
        )
    }
}
