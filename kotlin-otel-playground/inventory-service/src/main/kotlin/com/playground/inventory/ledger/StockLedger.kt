package com.playground.inventory.ledger

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("inventory.stock_ledger")
data class StockLedger(
    @Id
    val id: Long? = null,
    val productId: Long,
    val changeQuantity: Int,
    val reason: LedgerReason,
    val referenceId: String? = null,
    @CreatedDate
    val createdAt: Instant = Instant.now(),
)

enum class LedgerReason {
    RESERVATION,
    RESERVATION_CONFIRMED,
    RESERVATION_CANCELLED,
    RESTOCK,
}
