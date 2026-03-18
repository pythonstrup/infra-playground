package com.playground.inventory

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.transaction.ReactiveTransactionManager
import org.springframework.transaction.reactive.TransactionalOperator

@SpringBootApplication(scanBasePackages = ["com.playground.inventory", "com.playground.core"])
@EnableR2dbcAuditing
@EnableScheduling
class InventoryApplication {

    @Bean
    fun transactionalOperator(tm: ReactiveTransactionManager): TransactionalOperator =
        TransactionalOperator.create(tm)
}

fun main(args: Array<String>) {
    runApplication<InventoryApplication>(*args)
}
