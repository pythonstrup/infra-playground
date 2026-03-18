package com.playground.catalog.category

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.playground.core.exception.EntityNotFoundException
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val TREE_CACHE_KEY = "catalog:categories:tree"
        private val TREE_TTL = Duration.ofSeconds(300)
    }

    @Transactional
    suspend fun create(request: CreateCategoryRequest): CategoryNode {
        request.parentId?.let { parentId ->
            if (!categoryRepository.existsById(parentId)) {
                throw EntityNotFoundException("Parent category not found: $parentId")
            }
        }

        return Category(name = request.name, parentId = request.parentId)
            .let { categoryRepository.save(it) }
            .also {
                redisTemplate.delete(TREE_CACHE_KEY).awaitSingle()
                log.info("category_created id={} name={}", it.id, it.name)
            }
            .let { CategoryNode(id = it.id!!, name = it.name, children = emptyList()) }
    }

    suspend fun getTree(): List<CategoryNode> {
        redisTemplate.opsForValue().get(TREE_CACHE_KEY).awaitSingleOrNull()?.let { cached ->
            log.debug("category_tree cache_hit")
            return objectMapper.readValue(cached)
        }

        val tree = categoryRepository.findAll().toList()
            .let(CategoryNode::buildTree)

        redisTemplate.opsForValue()
            .set(TREE_CACHE_KEY, objectMapper.writeValueAsString(tree), TREE_TTL)
            .awaitSingle()
        log.debug("category_tree cache_miss count={}", tree.size)

        return tree
    }
}
