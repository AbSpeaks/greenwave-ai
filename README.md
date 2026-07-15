# GreenWave AI — Unified Mono-Repo (Strategy A)

GreenWave AI is a cloud-native, deep-tech infrastructure orchestration engine designed to optimize city-scale traffic patterns dynamically.

This repository is organized under a unified mono-repo layout (Strategy A) to separate proprietary low-latency backend systems from the public showroom landing pages.

## Repository Architecture

```text
greenwave-ai/
├── README.md                    # [This File] General workspace structure & directions
├── .gitignore                   # Multi-environment recursion ignore rules
│
├── core-engine/                 # SECURE BACKEND Source Tree (Java Microservices, Physics Engines)
│   ├── README.md                # Specific backend JNI / SUMO compilation instructions
│   ├── pom.xml                  # Parent Maven POM
│   ├── .env                     # Local environment keys database
│   ├── telemetry-service/       # Reactive ingestion (Port 8081)
│   ├── analytics-service/       # Traffic state estimators (Port 8082)
│   ├── optimizer-service/       # Scheduled optimizing split solvers (Port 8083)
│   └── simulation-service/      # Validation sandbox endpoint (Port 8084)
│
└── showroom-landing-page/       # PUBLIC SHOWROOM (Elite SpaceX-Style Dark Showroom)
    ├── index.html               # Homepage (Traffic Neural Net Visualizer)
    ├── approach.html            # Technical Architecture Blueprint Spec
    ├── mission.html             # Re-Engineering Urban Physics macroeconomics
    ├── progress.html            # Engineering Validation Lab (Digital Twin Widget)
    ├── contact.html             # Secure Intake channels (forms)
    ├── css/
    │   └── main.css             # Vanilla CSS Custom theme system (base #0B0C10)
    └── js/
        ├── app.js               # Event integrations and digital-twin mirror tickers
        └── showroom-canvas.js   # 3D interactive constellation neural net visualizer
```

---

## Workspace Decoupling

1. **Decoupled Showroom Deployment (Frontend)**
   * Point Vercel (or other hosting networks) directly to `/showroom-landing-page` as the root working directory.
   * Visual assets, CSS variables, and HTML pages are self-contained and run on vanilla JS with robust constellation visualizer fallbacks.

2. **Core Systems Build (Backend)**
   * Change directories to `core-engine/` and execute `./mvnw clean install` to compile the Spring Boot modules.
   * Microservices run independently and use Server-Sent Events (SSE) to broadcast live simulation statistics to benchmarking suites.
