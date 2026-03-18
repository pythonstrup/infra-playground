package com.playground.inventory.stock

import com.playground.core.web.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/inventory")
class StockController(
    private val stockService: StockService,
) {
    @GetMapping("/{productId}")
    suspend fun getStock(@PathVariable productId: Long): ApiResponse<StockResponse> =
        ApiResponse.ok(stockService.getStock(productId))

    @PostMapping("/{productId}/reserve")
    suspend fun reserve(
        @PathVariable productId: Long,
        @Valid @RequestBody request: ReserveRequest,
    ): ResponseEntity<ApiResponse<ReservationResponse>> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(stockService.reserve(productId, request)))

    @PostMapping("/{productId}/confirm")
    suspend fun confirm(
        @PathVariable productId: Long,
        @Valid @RequestBody request: ConfirmRequest,
    ): ApiResponse<ReservationResponse> =
        ApiResponse.ok(stockService.confirm(productId, request))

    @PostMapping("/{productId}/cancel")
    suspend fun cancel(
        @PathVariable productId: Long,
        @Valid @RequestBody request: CancelRequest,
    ): ApiResponse<ReservationResponse> =
        ApiResponse.ok(stockService.cancel(productId, request))

    @PostMapping("/{productId}/restock")
    suspend fun restock(
        @PathVariable productId: Long,
        @Valid @RequestBody request: RestockRequest,
    ): ResponseEntity<ApiResponse<StockResponse>> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(stockService.restock(productId, request)))

    @GetMapping("/{productId}/ledger")
    suspend fun getLedger(@PathVariable productId: Long): ApiResponse<List<StockLedgerResponse>> =
        ApiResponse.ok(stockService.getLedger(productId))
}
