package com.playground.fulfillment.shipment

import com.playground.core.web.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/shipments")
class ShipmentController(
    private val shipmentService: ShipmentService,
) {
    @PostMapping
    suspend fun create(@Valid @RequestBody request: CreateShipmentRequest): ResponseEntity<ApiResponse<ShipmentResponse>> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(shipmentService.create(request)))

    @GetMapping("/{id}")
    suspend fun getDetail(@PathVariable id: Long): ApiResponse<ShipmentDetailResponse> =
        ApiResponse.ok(shipmentService.getDetail(id))

    @GetMapping("/{id}/track")
    suspend fun track(@PathVariable id: Long): ApiResponse<ShipmentResponse> =
        ApiResponse.ok(shipmentService.getTrackingStatus(id))

    @PostMapping("/{id}/advance")
    suspend fun advance(@PathVariable id: Long): ApiResponse<ShipmentResponse> =
        ApiResponse.ok(shipmentService.advance(id))
}
