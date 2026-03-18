plugins {
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}

tasks.named<Jar>("jar") {
    enabled = true
}

dependencies {
    api(libs.spring.boot.starter.webflux)
    api(libs.spring.boot.starter.validation)
    api("org.springframework:spring-tx")
    api(libs.jackson.module.kotlin)
    api(libs.kotlin.reflect)
    api(libs.kotlinx.coroutines.reactor)
    api(libs.logback.ecs.encoder)
}
