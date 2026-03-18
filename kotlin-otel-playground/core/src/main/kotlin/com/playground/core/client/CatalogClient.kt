package com.playground.core.client

import com.playground.core.exception.EntityNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.reactive.function.client.awaitBodilessEntity

/**
 * HTTP client for catalog-service product verification.
 * Not a @Component — each consuming service exposes it as a @Bean with its own WebClient.
 */
class CatalogClient(private val webClient: WebClient) {

    private val log = LoggerFactory.getLogger(javaClass)

    suspend fun verifyProductExists(productId: Long) {
        try {
            webClient.get()
                .uri("/api/products/{id}", productId)
                .retrieve()
                .awaitBodilessEntity()
        } catch (ex: WebClientResponseException.NotFound) {
            throw EntityNotFoundException("Product not found: $productId")
        } catch (ex: WebClientResponseException) {
            log.error("catalog_service_unavailable productId={}", productId, ex)
            throw ex  // GlobalExceptionHandler maps WebClientResponseException → 502
        }
    }
}
