package com.playground.fulfillment.config

import com.playground.core.client.CatalogClient
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfig(
    @Value("\${catalog-service.url}") private val catalogUrl: String,
    @Value("\${inventory-service.url}") private val inventoryUrl: String,
) {
    @Bean
    fun catalogWebClient(builder: WebClient.Builder): WebClient =
        builder.clone().baseUrl(catalogUrl).build()

    @Bean
    fun inventoryWebClient(builder: WebClient.Builder): WebClient =
        builder.clone().baseUrl(inventoryUrl).build()

    @Bean
    fun catalogClient(@Qualifier("catalogWebClient") webClient: WebClient): CatalogClient =
        CatalogClient(webClient)
}
