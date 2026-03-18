package com.playground.catalog.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.playground.core.exception.EntityNotFoundException
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration

@Service
class ProductService(
    private val productRepository: ProductRepository,
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val CACHE_PREFIX = "catalog:product:"
        private val CACHE_TTL = Duration.ofSeconds(120)
    }

    @Transactional
    suspend fun create(request: CreateProductRequest): ProductResponse =
        Product(
            name = request.name,
            description = request.description,
            sku = request.sku,
            categoryId = request.categoryId,
            weightGrams = request.weightGrams,
        )
            .let { productRepository.save(it) }
            .also { log.info("product_created id={} sku={}", it.id, it.sku) }
            .let(ProductResponse::from)

    suspend fun getById(id: Long): ProductResponse =
        cachedOrLoad("$CACHE_PREFIX$id", CACHE_TTL) {
            productRepository.findById(id)
                ?.let(ProductResponse::from)
                ?: throw EntityNotFoundException("Product not found: $id")
        }

    suspend fun search(categoryId: Long?, keyword: String?): List<ProductResponse> =
        productRepository.search(categoryId, keyword)
            .map(ProductResponse::from)
            .toList()

    private suspend inline fun <reified T> cachedOrLoad(
        key: String,
        ttl: Duration,
        crossinline loader: suspend () -> T,
    ): T {
        redisTemplate.opsForValue().get(key).awaitSingleOrNull()?.let { cached ->
            log.debug("cache_hit key={}", key)
            return objectMapper.readValue<T>(cached)
        }

        return loader().also { value ->
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value), ttl).awaitSingle()
            log.debug("cache_miss key={}", key)
        }
    }
}
