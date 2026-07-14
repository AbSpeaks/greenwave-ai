# GreenWave AI - File and Architecture Overview

This document provides a live catalog of the files, directories, and modules in the GreenWave AI multi-module Spring Boot application. It details the purpose and operational mechanics of each file.

---

## Workspace Layout Summary

```
greenwave-ai/
├── pom.xml                                   # Root Parent POM (Maven Multi-module config)
├── .env                                      # Local environment configuration file
├── README.md                                 # General compilation and runtime guide
├── file_overview.md                          # [THIS FILE] Live repository report
├── telemetry-service/                        # high-throughput telemetry ingestion module (Port 8081)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/greenwave/ai/telemetry/
│       │   ├── TelemetryApplication.java     # Main class (loads .env dynamically)
│       │   ├── config/
│       │   │   └── TelemetryConfig.java      # Configuration property holder
│       │   └── controller/
│       │       └── HealthController.java     # WebFlux Reactive Health Check Endpoint
│       └── resources/application.yml
├── analytics-service/                        # Traffic queue state estimation module (Port 8082)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/greenwave/ai/analytics/
│       │   ├── AnalyticsApplication.java     # Main class
│       │   └── controller/
│       │       └── HealthController.java     # Spring MVC Health Check Endpoint
│       └── resources/application.yml
├── optimizer-service/                        # Timing calculations coordinator module (Port 8083)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/greenwave/ai/optimizer/
│       │   ├── OptimizerApplication.java     # Main class (Scheduler active)
│       │   ├── controller/
│       │   │   └── HealthController.java     # Health Check Endpoint
│       │   └── scheduler/
│       │       └── SignalScheduler.java      # Scheduled background split optimizer
│       └── resources/application.yml
└── simulation-service/                       # SUMO Sandbox Controller interface (Port 8084)
    ├── pom.xml
    └── src/main/
        ├── java/com/greenwave/ai/simulation/
        │   ├── SimulationApplication.java    # Main class
        │   ├── controller/
        │   │   └── HealthController.java     # Health Check Endpoint (runs mock step)
        │   └── service/
        │       └── SumoInterfaceService.java # libtraci integration and JAR documentation
        └── resources/application.yml
```

---

## Detailed File catalog

### 1. Root Files

#### 📄 [pom.xml](file:///Users/abin/greenwave-ai/pom.xml)
*   **Role**: Root parent pom configuration.
*   **Workings**: Configures Maven dependencies globally (Spring Boot 3.2.5 starter dependencies, Lombok, Junit 5), declares shared properties (Java 21 compiler version, library versions), and registers the four submodules under the `<modules>` tag.

#### 📄 [.env](file:///Users/abin/greenwave-ai/.env)
*   **Role**: Local key-value database for deployment configurations.
*   **Workings**: Contains variables like `TOMTOM_API_KEY` and `SUMO_HOME` to isolate credentials from codebase binaries.

#### 📄 [README.md](file:///Users/abin/greenwave-ai/README.md)
*   **Role**: Developer onboarding instructions.
*   **Workings**: Explains compilation, Maven wrapper generation, dependency linking (JNI wrapper steps), and microservice running commands.

---

### 2. Telemetry Service (`telemetry-service` - Port 8081)

#### 📄 [telemetry-service/pom.xml](file:///Users/abin/greenwave-ai/telemetry-service/pom.xml)
*   **Role**: Telemetry module descriptors.
*   **Workings**: Declares `spring-boot-starter-webflux` as its networking engine to handle high-throughput vehicle trajectories reactively via Netty. Declares `dotenv-java` dependency.

#### 📄 [TelemetryApplication.java](file:///Users/abin/greenwave-ai/telemetry-service/src/main/java/com/greenwave/ai/telemetry/TelemetryApplication.java)
*   **Workings**: Reads [.env](file:///Users/abin/greenwave-ai/.env) at startup via `Dotenv.configure()`, loops through all key-values, and maps them to JVM `System.properties`. This integrates environment variables natively into Spring Boot's context before `SpringApplication.run()` launches.

#### 📄 [TelemetryConfig.java](file:///Users/abin/greenwave-ai/telemetry-service/src/main/java/com/greenwave/ai/telemetry/config/TelemetryConfig.java)
*   **Workings**: Configures properties class. Injects variable values (`TOMTOM_API_KEY`, `SUMO_HOME`) from System properties using `@Value("${PROPERTY_NAME:}")` and exposes them via standard getter methods.

#### 📄 [HealthController.java](file:///Users/abin/greenwave-ai/telemetry-service/src/main/java/com/greenwave/ai/telemetry/controller/HealthController.java)
*   **Workings**: WebFlux RestController exposing `/health` reactive endpoint. Accesses the [TelemetryConfig](file:///Users/abin/greenwave-ai/telemetry-service/src/main/java/com/greenwave/ai/telemetry/config/TelemetryConfig.java) bean to verify credentials loading status in the returned JSON.

#### 📄 [application.yml](file:///Users/abin/greenwave-ai/telemetry-service/src/main/resources/application.yml)
*   **Role**: Sets standard application port to `8081` and application name to `telemetry-service`.

---

### 3. Analytics Service (`analytics-service` - Port 8082)

#### 📄 [analytics-service/pom.xml](file:///Users/abin/greenwave-ai/analytics-service/pom.xml)
*   **Role**: Analytics dependency layout.
*   **Workings**: Includes `spring-boot-starter-web` for standard Servlet MVC APIs hosted inside Tomcat.

#### 📄 [AnalyticsApplication.java](file:///Users/abin/greenwave-ai/analytics-service/src/main/java/com/greenwave/ai/analytics/AnalyticsApplication.java)
*   **Role**: Main entrypoint class.

#### 📄 [HealthController.java](file:///Users/abin/greenwave-ai/analytics-service/src/main/java/com/greenwave/ai/analytics/controller/HealthController.java)
*   **Workings**: Exposes MVC REST endpoint `/health` returning status JSON confirming Spring Servlet operations are online.

#### 📄 [application.yml](file:///Users/abin/greenwave-ai/analytics-service/src/main/resources/application.yml)
*   **Role**: Sets standard application port to `8082`.

---

### 4. Optimizer Service (`optimizer-service` - Port 8083)

#### 📄 [optimizer-service/pom.xml](file:///Users/abin/greenwave-ai/optimizer-service/pom.xml)
*   **Role**: Optimizer dependencies descriptor.

#### 📄 [OptimizerApplication.java](file:///Users/abin/greenwave-ai/optimizer-service/src/main/java/com/greenwave/ai/optimizer/OptimizerApplication.java)
*   **Workings**: Decorates main configuration class with `@EnableScheduling` to activate the Spring Boot task execution service.

#### 📄 [SignalScheduler.java](file:///Users/abin/greenwave-ai/optimizer-service/src/main/java/com/greenwave/ai/optimizer/scheduler/SignalScheduler.java)
*   **Workings**: Contains a `@Scheduled(fixedRate = 5000)` function that periodically simulates optimization routines (e.g., green-split calculations) every 5 seconds and prints log reports.

#### 📄 [HealthController.java](file:///Users/abin/greenwave-ai/optimizer-service/src/main/java/com/greenwave/ai/optimizer/controller/HealthController.java)
*   **Role**: MVC health check endpoint.

#### 📄 [application.yml](file:///Users/abin/greenwave-ai/optimizer-service/src/main/resources/application.yml)
*   **Role**: Sets standard application port to `8083`.

---

### 5. Simulation Service (`simulation-service` - Port 8084)

#### 📄 [simulation-service/pom.xml](file:///Users/abin/greenwave-ai/simulation-service/pom.xml)
*   **Role**: Simulation dependency layout.

#### 📄 [SimulationApplication.java](file:///Users/abin/greenwave-ai/simulation-service/src/main/java/com/greenwave/ai/simulation/SimulationApplication.java)
*   **Role**: Main entrypoint class.

#### 📄 [SumoInterfaceService.java](file:///Users/abin/greenwave-ai/simulation-service/src/main/java/com/greenwave/ai/simulation/service/SumoInterfaceService.java)
*   **Role**: SUMO integration service.
*   **Workings**: Documents dynamic wrapper JAR inclusion (`libtraci.jar`), JNI native library configuration (system dylib paths on Mac/Linux), and exposes mock method wrappers representing sandbox simulation step increments.

#### 📄 [HealthController.java](file:///Users/abin/greenwave-ai/simulation-service/src/main/java/com/greenwave/ai/simulation/controller/HealthController.java)
*   **Workings**: Exposes `/health` endpoint. Querying this endpoint triggers a mock initialization and step invocation on [SumoInterfaceService](file:///Users/abin/greenwave-ai/simulation-service/src/main/java/com/greenwave/ai/simulation/service/SumoInterfaceService.java) to verify functional calls.

#### 📄 [application.yml](file:///Users/abin/greenwave-ai/simulation-service/src/main/resources/application.yml)
*   **Role**: Sets standard application port to `8084`.

#### 📄 [index.html](file:///Users/abin/greenwave-ai/simulation-service/src/main/resources/static/index.html)
*   **Role**: Visual Dashboard HTML and Layout.
*   **Workings**: Loads Google Fonts and Leaflet.js libraries, defines CSS styles for custom glowing vehicle and traffic signal markers, and provides structural layout panels for operational metrics and system configuration controls.

#### 📄 [app.js](file:///Users/abin/greenwave-ai/simulation-service/src/main/resources/static/app.js)
*   **Role**: Real-Time Map Animation and Dashboard Logic.
*   **Workings**: Establishes SSE stream connection to the backend telemetry broadcaster. Translates internal simulator coordinates using scale transformations and a $29^\circ$ clockwise rotation to align vehicle routes exactly onto Manhattan's 5th Ave and 42nd St dark map. Manages glowing markers for cars (with directional headlights) and stopline signals.
