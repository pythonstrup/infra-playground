package com.playground.catalog.product

import kotlinx.coroutines.flow.Flow
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository

interface ProductRepository : CoroutineCrudRepository<Product, Long> {

    @Query(
        """
            SELECT * FROM catalog.products p
            WHERE (:categoryId IS NULL OR p.category_id = CAST(:categoryId AS BIGINT))
              AND (:keyword IS NULL
                   OR LOWER(p.name) LIKE LOWER('%' || CAST(:keyword AS TEXT) || '%')
                   OR LOWER(COALESCE(p.description, '')) LIKE LOWER('%' || CAST(:keyword AS TEXT) || '%'))
            ORDER BY p.created_at DESC
        """,
    )
    fun search(categoryId: Long?, keyword: String?): Flow<Product>
}
