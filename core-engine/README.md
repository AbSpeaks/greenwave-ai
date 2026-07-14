# GreenWave AI - Adaptive Traffic Control Platform

GreenWave AI is a software-defined, hardware-agnostic adaptive traffic control platform. This codebase has been refactored into an enterprise-grade JVM-based microservices architecture using **Spring Boot 3.2.5** and **Java 21+**.

---

## Project Structure

This is a multi-module Maven project consisting of four distinct microservices:

*   **`telemetry-service`** (Port `8081`): Reactive service built on Spring WebFlux for high-throughput vehicle trajectory telemetry ingestion.
*   **`analytics-service`** (Port `8082`): Standard Web MVC service for traffic state and queue length estimation.
*   **`optimizer-service`** (Port `8083`): Service for calculating signal splits and timing offsets; includes a scheduling coordinator.
*   **`simulation-service`** (Port `8084`): Interfaces with the virtual simulation sandbox (SUMO).

---

## Prerequisites

1.  **Java SDK**: Ensure you have **Java 21 or later** installed (`java -version`).
2.  **SUMO**: Ensure SUMO is installed on your machine and `SUMO_HOME` is set:
    ```bash
    export SUMO_HOME="/opt/homebrew/opt/sumo/share/sumo"
    ```
3.  **API Keys**: Enter your TomTom API key in the root `.env` file:
    ```env
    TOMTOM_API_KEY=your_key_here
    SUMO_HOME=/opt/homebrew/opt/sumo/share/sumo
    ```

---

## Environment Variables & Dotenv loading

The `telemetry-service` loads the root `.env` file dynamically at boot time using the `dotenv-java` library and populates them into the Spring environment properties. It binds `TOMTOM_API_KEY` and `SUMO_HOME` inside `TelemetryConfig`.

---

## SUMO libtraci Integration Guide (`simulation-service`)

The `simulation-service` communicates directly with the SUMO binaries via JNI wrappers.

1.  **JAR File**: Add the local JNI JAR file to the classpath (`libtraci.jar`), which is typically located inside the `<SUMO_HOME>/bin` directory.
2.  **Native Library Path**: When booting the service, you must explicitly point Java to the folder containing the compiled dynamic native libraries (`libtracicpp.dylib` or `libsumocpp.dylib`):
    ```bash
    java -Djava.library.path=/opt/homebrew/Cellar/sumo/1.20.0/lib -jar simulation-service-0.0.1-SNAPSHOT.jar
    ```

---

## Building the Project

Ensure you are in the root directory. To generate the Maven Wrapper files (highly recommended for portable building):
```bash
mvn wrapper:wrapper
```

Build and compile all four microservices:
```bash
./mvnw clean install
```
*(Use `-DskipTests` to bypass tests during development builds: `./mvnw clean install -DskipTests`)*

---

## Running the Services

You can run each Spring Boot microservice directly from the root parent directory by specifying its module flag:

```bash
# Run Telemetry Service (Port 8081)
./mvnw spring-boot:run -pl telemetry-service

# Run Analytics Service (Port 8082)
./mvnw spring-boot:run -pl analytics-service

# Run Optimizer Service (Port 8083)
./mvnw spring-boot:run -pl optimizer-service

# Run Simulation Service (Port 8084)
./mvnw spring-boot:run -pl simulation-service
```

---

## Health Check Verification

Once running, query the respective health checks in your terminal:
```bash
# Telemetry (WebFlux)
curl http://localhost:8081/health

# Analytics (MVC)
curl http://localhost:8082/health

# Optimizer (MVC)
curl http://localhost:8083/health

# Simulation (MVC)
curl http://localhost:8084/health
```
