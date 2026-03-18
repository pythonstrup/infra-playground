package com.playground.inventory.config

import com.playground.core.client.CatalogClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfig(
    @Value("\${catalog-service.url}") private val catalogUrl: String,
) {
    @Bean
    fun catalogWebClient(builder: WebClient.Builder): WebClient =
        builder.clone().baseUrl(catalogUrl).build()

    @Bean
    fun catalogClient(catalogWebClient: WebClient): CatalogClient =
        CatalogClient(catalogWebClient)
}
