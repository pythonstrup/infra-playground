package com.playground.fulfillment.client

import com.playground.core.web.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.springframework.web.reactive.function.client.awaitBodilessEntity

@Component
class InventoryClient(
    @Qualifier("inventoryWebClient") private val webClient: WebClient,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    suspend fun reserve(productId: Long, quantity: Int): ReservationResult {
        val response = webClient.post()
            .uri("/api/inventory/{productId}/reserve", productId)
            .bodyValue(mapOf("quantity" to quantity))
            .retrieve()
            .awaitBody<ApiResponse<ReservationResult>>()

        val data = response.data
            ?: error("Invalid response from inventory service for reserve: productId=$productId")

        log.info("inventory_reserved productId={} ref={}", productId, data.referenceId)
        return data
    }

    suspend fun confirm(productId: Long, referenceId: String) {
        webClient.post()
            .uri("/api/inventory/{productId}/confirm", productId)
            .bodyValue(mapOf("referenceId" to referenceId))
            .retrieve()
            .awaitBodilessEntity()

        log.info("inventory_confirmed productId={} ref={}", productId, referenceId)
    }

    /**
     * Cancels an inventory reservation with one retry.
     * Logs a CRITICAL warning if both attempts fail — the HELD reservation
     * will remain until its expiresAt is reached (15 min TTL set by inventory-service).
     */
    suspend fun cancel(productId: Long, referenceId: String) {
        repeat(2) { attempt ->
            try {
                webClient.post()
                    .uri("/api/inventory/{productId}/cancel", productId)
                    .bodyValue(mapOf("referenceId" to referenceId))
                    .retrieve()
                    .awaitBodilessEntity()

                log.info("inventory_cancelled productId={} ref={}", productId, referenceId)
                return
            } catch (ex: Exception) {
                log.warn("inventory_cancel_attempt_failed attempt={} productId={} ref={}", attempt + 1, productId, referenceId, ex)
            }
        }
        log.error("COMPENSATION_FAILED inventory_cancel exhausted retries productId={} ref={} — reservation will expire after TTL", productId, referenceId)
    }
}

data class ReservationResult(
    val reservationId: Long = 0,
    val productId: Long = 0,
    val quantity: Int = 0,
    val referenceId: String = "",
    val status: String = "",
)
