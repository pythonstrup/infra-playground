package com.playground.inventory.ledger

import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository

interface StockLedgerRepository : CoroutineCrudRepository<StockLedger, Long> {
    fun findByProductIdOrderByCreatedAtDesc(productId: Long): Flow<StockLedger>
}
