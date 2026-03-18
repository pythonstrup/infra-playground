package com.playground.catalog.category

import com.playground.core.web.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService,
) {
    @PostMapping
    suspend fun create(@Valid @RequestBody request: CreateCategoryRequest): ResponseEntity<ApiResponse<CategoryNode>> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(categoryService.create(request)))

    @GetMapping("/tree")
    suspend fun getTree(): ApiResponse<List<CategoryNode>> =
        ApiResponse.ok(categoryService.getTree())
}
