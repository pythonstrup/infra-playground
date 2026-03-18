package com.playground.inventory.stock

import org.springframework.data.repository.kotlin.CoroutineCrudRepository

interface StockRepository : CoroutineCrudRepository<Stock, Long> {
    suspend fun findByProductId(productId: Long): Stock?
}
