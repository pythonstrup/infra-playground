FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY gradlew settings.gradle.kts build.gradle.kts gradle.properties ./
COPY gradle/ gradle/
COPY core/ core/

ARG SERVICE_NAME
COPY ${SERVICE_NAME}/ ${SERVICE_NAME}/

RUN chmod +x gradlew && ./gradlew :${SERVICE_NAME}:bootJar --no-daemon -x test

# --- Runtime ---
FROM eclipse-temurin:21-jre-alpine

ARG SERVICE_NAME
ARG OTEL_AGENT_VERSION=2.11.0

ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_AGENT_VERSION}/opentelemetry-javaagent.jar /opt/opentelemetry-javaagent.jar

COPY --from=builder /app/${SERVICE_NAME}/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:/opt/opentelemetry-javaagent.jar", "-jar", "/app/app.jar"]
