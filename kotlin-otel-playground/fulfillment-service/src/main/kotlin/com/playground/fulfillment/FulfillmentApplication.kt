package com.playground.fulfillment

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing

@SpringBootApplication(scanBasePackages = ["com.playground.fulfillment", "com.playground.core"])
@EnableR2dbcAuditing
class FulfillmentApplication

fun main(args: Array<String>) {
    runApplication<FulfillmentApplication>(*args)
}
