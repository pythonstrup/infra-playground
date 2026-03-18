package com.playground.catalog.product

import com.playground.core.web.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/products")
class ProductController(
    private val productService: ProductService,
) {
    @PostMapping
    suspend fun create(@Valid @RequestBody request: CreateProductRequest): ResponseEntity<ApiResponse<ProductResponse>> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(productService.create(request)))

    @GetMapping("/{id}")
    suspend fun getById(@PathVariable id: Long): ApiResponse<ProductResponse> =
        ApiResponse.ok(productService.getById(id))

    @GetMapping
    suspend fun search(
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false) keyword: String?,
    ): ApiResponse<List<ProductResponse>> =
        ApiResponse.ok(productService.search(categoryId, keyword))
}
