package com.playground.core.exception

/** Thrown when a requested entity does not exist. Maps to HTTP 404. */
class EntityNotFoundException(message: String) : RuntimeException(message)

/** Thrown when a business rule is violated. Maps to HTTP 409. */
class BusinessException(message: String) : RuntimeException(message)

/** Thrown when a rate limit is exceeded. Maps to HTTP 429. */
class RateLimitExceededException(message: String) : RuntimeException(message)
