package com.playground.catalog.category

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateCategoryRequest(
    @field:NotBlank
    @field:Size(max = 255)
    val name: String,

    val parentId: Long? = null,
)

data class CategoryNode(
    val id: Long,
    val name: String,
    val children: List<CategoryNode>,
) {
    companion object {
        /** Builds a tree from a flat list using groupBy — O(n) instead of O(n²). */
        fun buildTree(categories: List<Category>): List<CategoryNode> {
            val childrenByParent = categories.groupBy { it.parentId }

            fun buildNodes(parentId: Long?): List<CategoryNode> =
                childrenByParent[parentId]
                    ?.map { cat -> CategoryNode(cat.id!!, cat.name, buildNodes(cat.id)) }
                    ?: emptyList()

            return buildNodes(null)
        }
    }
}
