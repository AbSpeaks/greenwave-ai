/* ==========================================================================
   GREENWAVE AI — ARCHITECTURE ORACLE TERMINAL v4.0
   Complete project intelligence. Scoring-based KB. Never returns "not indexed".
   Gemini AI live mode when GW_GEMINI_KEY is set in config.js
   ========================================================================== */

'use strict';

(function () {

  /* ── CONFIG ─────────────────────────────────────────────────────────────── */
  const GEMINI_API_KEY = (window.GW_GEMINI_KEY && window.GW_GEMINI_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
    ? window.GW_GEMINI_KEY
    : null;

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  /* ── FULL SYSTEM PROMPT (injected into Gemini when live) ─────────────────── */
  const SYSTEM_PROMPT = `You are the GreenWave AI Architecture Oracle — an authoritative, precise technical intelligence embedded in the GreenWave AI infrastructure showroom terminal. You have deep knowledge of every layer of the GreenWave AI system.

## ABSOLUTE IDENTITY CONSTRAINTS (NEVER VIOLATE):
- GreenWave AI is a cloud-native computational urban physics engine. NOT a web app, SaaS, or consumer dashboard.
- 100% pure software. Zero dependency on physical hardware, cameras, sensors, or ground loops.
- The SUMO-based simulation service is an INTERNAL validation testbed, NOT the commercial product.
- No user dashboards, no login portals, no consumer UI in the commercial product.

## COMPLETE PROJECT ARCHITECTURE:

### Repository Structure (Strategy A Mono-Repo):
- /core-engine/ — Proprietary Java backend (4 Spring Boot microservices)
- /showroom-landing-page/ — Public static presentation layer (HTML/CSS/JS)

### Microservice Stack (core-engine/):
1. **Telemetry Service** (port 8081) — Spring Boot WebFlux / Project Reactor. Non-blocking reactive ingestion. Reads environment config (TOMTOM_API_KEY, SUMO_HOME) from .env via Dotenv library loaded before SpringApplication.run(). Exposes /health reactive endpoint via WebFlux RestController.

2. **Analytics Service** (port 8082) — Spring Boot Web (Tomcat/Servlet MVC). Queue length estimation and density vector modeling. Exposes /health endpoint returning Spring Servlet status JSON.

3. **Optimizer Service** (port 8083) — Spring Boot + @EnableScheduling. Core SignalScheduler runs @Scheduled(fixedRate=5000) every 5 seconds executing green-split optimization calculations and logging reports. Health endpoint at /health.

4. **Simulation Service** (port 8084) — Spring Boot + SumoInterfaceService. Internal digital-twin mathematical testbed. Implements full vehicle physics simulation at 100ms step resolution (10 ticks/second). Signal modes: FIXED (150 tick green / 30 tick yellow) and ADAPTIVE (Max-Pressure algorithm). Exposes SSE stream of full simulation state.

### Simulation Engine Details (SumoInterfaceService.java):
- Vehicle physics: car-following model with MAX_SPEED=4.0 px/step, SAFE_DISTANCE=35px, smooth acceleration (+0.2/tick) and deceleration (-0.4/tick).
- Spawning: Poisson arrival process. Probability per tick = arrivalRate / 600. Default arrivalRate = 12 vehicles/minute/lane. Four lanes: SOUTHBOUND, NORTHBOUND, EASTBOUND, WESTBOUND.
- Signal phases: 0=NS_GREEN/EW_RED, 1=NS_YELLOW/EW_RED, 2=EW_GREEN/NS_RED, 3=EW_YELLOW/NS_RED.
- ADAPTIVE mode: Max-Pressure algorithm — switches phase when queue differential >= 2 vehicles, minimum green = 50 ticks (5s), maximum green = 250 ticks (25s).
- Stoplines: SOUTHBOUND y=240, NORTHBOUND y=360, EASTBOUND x=240, WESTBOUND x=360 (600x600 grid).
- Metrics tracked: totalVehiclesSpawned, totalVehiclesPassed, averageDelay, queueNS, queueEW.
- State exposed via getSimulationState() as SSE-streamed Map with all vehicle positions, angles, speeds, and signal states.
- Frontend (app.js): SSE stream consumer, coordinate transform with 29° clockwise rotation to map onto Manhattan's 5th Ave / 42nd St dark tile layer using Leaflet.js.

### Physics Engine Models:
- LWR (Lighthill-Whitham-Richards): ∂ρ/∂t + ∂(ρv)/∂x = 0. Compressible fluid continuum model. Shockwave speed via Rankine-Hugoniot: s = (q₂-q₁)/(ρ₂-ρ₁).
- MFD (Macroscopic Fundamental Diagram): Maps network flow Q vs accumulation N at district level. Monitors proximity to critical accumulation Nc. Activates perimeter control when approaching gridlock branch.
- Kinetic Energy Conservation: Green wave optimizer for heavy freight corridors. Minimizes KE = ½mv² loss across consecutive intersections.

### Data Pipeline:
- Ingestion: Cloud-to-cloud API connections to city GPS telemetry endpoints and mobility data streams.
- Processing: Reactive JVM pipeline. <15ms end-to-end optimization cycle.
- Actuation: Encrypted override dispatch to city signal controllers via secured API protocols. Autonomous loop, zero human relay.

### Tech Stack:
- Java 21, Spring Boot 3.2.5, Maven multi-module reactor build.
- Telemetry: spring-boot-starter-webflux (Netty), dotenv-java.
- Analytics/Optimizer: spring-boot-starter-web (Tomcat).
- Build: mvnw Maven wrapper, parent POM manages shared dependency versions.
- Frontend showroom: Vanilla HTML/CSS/JS, Space Grotesk + Space Mono fonts, canvas particle animation, Gemini 2.0 Flash AI terminal.

### Environment Config (.env):
- TOMTOM_API_KEY: Traffic data API credentials.
- SUMO_HOME: Path to SUMO simulation installation for JNI (libtraci).
- Loaded via Dotenv.configure() → System.setProperty() before Spring context initialization.

## RESPONSE RULES:
- Be clinically precise. Use real engineering terminology.
- For code-level questions: reference actual class names, method names, line-level details from the codebase.
- Responses: 3-6 sentences for factual, up to 12 for complex architectural questions.
- For hardware/dashboard/app misclassification queries: authoritatively correct with guardrail protocol.
- Terminal-friendly formatting: use short line breaks, not markdown headers.`;

  /* ── COMPREHENSIVE KNOWLEDGE BASE (local fallback) ───────────────────────── */
  // Each entry: { keywords: [...], score contribution per keyword hit, response }
  // The KB uses a scoring approach — highest score wins. No "not found" ever.

  const KB = [

    // ── WHAT IS / OVERVIEW ──────────────────────────────────────────────────
    {
      keys: ['what is greenwave','greenwave ai','what do you do','tell me about','overview','explain greenwave','introduce','about this project','about greenwave','purpose','what does greenwave','what is this'],
      response: `GREENWAVE AI — A cloud-native computational urban physics engine that models urban traffic as a compressible fluid system. The engine applies three simultaneous mathematical models: LWR shockwave equations (fluid dynamics), Macroscopic Fundamental Diagrams (thermodynamic network modeling), and Kinetic Energy Conservation optimization. It operates via cloud-to-cloud API ingestion of digital GPS telemetry, processes in <15ms, and deploys autonomous signal override commands to city controllers. 100% pure software — zero physical hardware, zero consumer UI, zero human relay in the actuation loop.`
    },

    // ── CORE PHYSICS / LWR ─────────────────────────────────────────────────
    {
      keys: ['lwr','lighthill','whitham','richards','fluid','compressible','continuum','conservation law','density wave','flow model'],
      response: `LWR CONTINUUM MODEL — GreenWave applies the Lighthill-Whitham-Richards equation: ∂ρ/∂t + ∂(ρv)/∂x = 0, treating vehicle traffic as compressible fluid through urban road conduits. The engine solves this conservation law continuously across the network, computing density-velocity-flux relationships at every monitored corridor. Upstream shockwave formation events are detected before they manifest as visible congestion, and pre-emptive signal override commands are dispatched kilometres ahead of the wave front.`
    },

    // ── SHOCKWAVE ──────────────────────────────────────────────────────────
    {
      keys: ['shockwave','shock wave','phantom jam','braking','rankine','hugoniot','compression wave','wave front','wave propagation','upstream'],
      response: `SHOCKWAVE DISSOLUTION PROTOCOL — Traffic shockwaves are density discontinuities where ∂q/∂x experiences jump conditions. GreenWave resolves shockwave propagation speed via the Rankine-Hugoniot condition: s = (q₂ - q₁)/(ρ₂ - ρ₁). The physics engine continuously tracks these discontinuities across the road network and issues pre-emptive signal timing overrides to dissolve the density gradient before it propagates downstream into visible braking cascades and phantom jams.`
    },

    // ── MFD ────────────────────────────────────────────────────────────────
    {
      keys: ['mfd','macroscopic','fundamental diagram','saturation','critical density','tipping point','perimeter','accumulation','gridlock branch','district level'],
      response: `MFD THERMODYNAMIC MODEL — The Macroscopic Fundamental Diagram maps network flow Q against accumulation density N at the urban district level. GreenWave monitors each sub-network's MFD state coordinate in real-time. When flow-density state approaches the critical accumulation Nc (the saturation tipping point where the network collapses into the gridlock branch of the MFD curve), the engine activates macro-boundary perimeter inflow control — reducing upstream entry rates to maintain the district in the free-flow regime.`
    },

    // ── KINETIC / FREIGHT ──────────────────────────────────────────────────
    {
      keys: ['kinetic','momentum','freight','cargo','truck','heavy vehicle','green wave','stop start','ke =','½mv','energy conservation','fuel','emissions'],
      response: `KINETIC ENERGY CONSERVATION OPTIMIZER — Every stop-start cycle for a loaded freight vehicle wastes KE = ½mv² that must be re-expended on re-acceleration, amplifying fuel burn and pavement stress. GreenWave's optimizer calculates minimum-loss green wave windows across designated freight corridors by solving signal phase progressions that guarantee heavy transit vectors (m > 40t) maintain thermodynamically optimal cruising velocity v_opt across consecutive intersections without braking interruption.`
    },

    // ── MICROSERVICES OVERVIEW ─────────────────────────────────────────────
    {
      keys: ['microservice','services','service architecture','four services','all services','ports','8081','8082','8083','8084','spring boot services'],
      response: `MICROSERVICE DECOMPOSITION — Four Spring Boot services:\n1. Telemetry (8081): WebFlux/Reactor reactive ingestion. Reads .env via Dotenv before Spring context loads.\n2. Analytics (8082): Servlet MVC/Tomcat. Queue estimation and density vector modeling.\n3. Optimizer (8083): @EnableScheduling active. SignalScheduler fires every 5000ms for green-split calculations.\n4. Simulation (8084): Internal digital-twin testbed. SumoInterfaceService runs full vehicle physics at 100ms step resolution. NOT the commercial product.`
    },

    // ── TELEMETRY SERVICE ──────────────────────────────────────────────────
    {
      keys: ['telemetry service','telemetryapplication','telemetryconfig','webflux','netty','reactive','dotenv','tomtom','8081','ingest'],
      response: `TELEMETRY SERVICE (port 8081) — Built on spring-boot-starter-webflux with Netty as the non-blocking I/O engine, enabling thousands of concurrent reactive stream consumers without thread-blocking overhead. TelemetryApplication.java loads the .env file at JVM startup via Dotenv.configure(), maps all key-value pairs to System.setProperty() before SpringApplication.run() initializes the Spring context. TelemetryConfig.java injects TOMTOM_API_KEY and SUMO_HOME via @Value("\${PROPERTY_NAME:}") annotations. Health endpoint: /health — reactive WebFlux RestController returning credential load status.`
    },

    // ── ANALYTICS SERVICE ──────────────────────────────────────────────────
    {
      keys: ['analytics service','analyticsapplication','analytics','8082','queue length','density model','servlet','tomcat'],
      response: `ANALYTICS SERVICE (port 8082) — Standard Spring Boot Web (Tomcat/Servlet MVC). Responsible for queue length estimation and traffic density vector modeling from ingested telemetry data. Uses spring-boot-starter-web for synchronous MVC REST APIs. HealthController.java exposes /health endpoint confirming Spring Servlet operations are online. Application name and port 8082 configured in application.yml.`
    },

    // ── OPTIMIZER SERVICE ──────────────────────────────────────────────────
    {
      keys: ['optimizer','optimizerapplication','signalscheduler','signal scheduler','@enablescheduling','@scheduled','fixedrate','5000','green split','split calculation','8083'],
      response: `OPTIMIZER SERVICE (port 8083) — Core signal timing coordinator. OptimizerApplication.java is decorated with @EnableScheduling to activate Spring's task execution framework. SignalScheduler.java contains a @Scheduled(fixedRate=5000) method that fires every 5 seconds, executes green-split optimization routines across monitored intersections, and logs optimization reports. This is where LWR + MFD + KE model outputs converge into concrete signal phase timing overrides.`
    },

    // ── SIMULATION SERVICE ─────────────────────────────────────────────────
    {
      keys: ['simulation','sumo','sumointerface','simulationapplication','libtraci','jni','digital twin','8084','testbed','validation','adaptive','fixed mode','max pressure'],
      response: `SIMULATION SERVICE (port 8084) — INTERNAL mathematical validation testbed. SumoInterfaceService.java implements full vehicle physics at 100ms step resolution (10 ticks/sec). Spawning: Poisson arrival, probability = arrivalRate/600 per tick. Default: 12 vehicles/min/lane across 4 directions. Car-following: MAX_SPEED=4px/step, SAFE_DISTANCE=35px, smooth accel +0.2/decel -0.4 per tick. Signal modes: FIXED (150-tick green / 30-tick yellow) or ADAPTIVE (Max-Pressure — switches when queue differential ≥ 2, min green 5s, max 25s). NOT the commercial product.`
    },

    // ── SIGNAL MODES / ADAPTIVE ────────────────────────────────────────────
    {
      keys: ['adaptive','fixed','signal mode','max pressure','queue differential','phase','signal phase','green phase','yellow phase','ns_green','ew_green'],
      response: `SIGNAL CONTROL ALGORITHMS — Two modes in SumoInterfaceService:\nFIXED: Signal cycles deterministically. Green phase = 150 ticks (15s), Yellow = 30 ticks (3s). Phases: 0=NS_GREEN/EW_RED → 1=NS_YELLOW → 2=EW_GREEN/NS_RED → 3=EW_YELLOW → repeat.\nADAPTIVE (Max-Pressure): Phase switches when queue differential (queueEW - queueNS) ≥ 2 vehicles. Minimum green = 50 ticks (5s). Maximum green = 250 ticks (25s) as safety cap. Yellow transition always 30 ticks (3s). Significantly reduces average vehicle delay under high-variance arrival patterns.`
    },

    // ── VEHICLE PHYSICS ────────────────────────────────────────────────────
    {
      keys: ['vehicle','car following','speed','acceleration','deceleration','stopline','spawn','arrival rate','poisson','southbound','northbound','eastbound','westbound'],
      response: `VEHICLE PHYSICS MODEL — Each vehicle is modeled in a 600×600 pixel grid. Four lanes: SOUTHBOUND (y: 0→600, stopline y=240), NORTHBOUND (y: 600→0, stopline y=360), EASTBOUND (x: 0→600, stopline x=240), WESTBOUND (x: 600→0, stopline x=360). Car-following: target speed reduces to 0 when distance to vehicle ahead < 15px, scales linearly to MAX_SPEED at 35px gap. Red-light braking: target speed = 0 within 10px of stopline when light is red. Speed changes smoothly: +0.2 acceleration per tick, -0.4 deceleration. Vehicles removed when out-of-bounds and counted as totalVehiclesPassed.`
    },

    // ── SSE / FRONTEND MAP ─────────────────────────────────────────────────
    {
      keys: ['sse','server sent events','leaflet','map','manhattan','coordinate','rotation','29 degree','frontend','app.js','visualization','real time map'],
      response: `SIMULATION FRONTEND (app.js) — Establishes Server-Sent Events (SSE) connection to the simulation backend SSE broadcast endpoint. Receives full simulation state (vehicle positions, speeds, angles, signal states) as JSON on each tick. Translates internal 600×600 pixel grid coordinates to real-world geographic coordinates via scale transforms and a 29° clockwise rotation to align vehicle routes precisely onto Manhattan's 5th Avenue and 42nd Street intersection using a Leaflet.js dark tile map. Renders glowing vehicle markers with directional headlights and stopline signal markers.`
    },

    // ── INGESTION / DATA PIPELINE ─────────────────────────────────────────
    {
      keys: ['ingest','ingestion','gps','telemetry','data','api','cloud api','city api','stream','pipeline','data source','positioning'],
      response: `INGESTION ARCHITECTURE — GreenWave's cloud layer establishes secure cloud-to-cloud API connections to ingest purely digital GPS telemetry vectors and global positioning data streams from city network systems. All data sources are software endpoints — digital position vectors, movement timestamps, network velocity states — consumed via encrypted API channels into the reactive processing pipeline. No physical hardware, cameras, sensors, or ground loops. 100% pure software ingestion completing within sub-100ms cycle time.`
    },

    // ── TECH STACK / LANGUAGE ─────────────────────────────────────────────
    {
      keys: ['java','spring','reactor','webflux','maven','pom','spring boot','lombok','junit','project reactor','reactive streams','jvm','java 21'],
      response: `TECHNOLOGY STACK — Java 21 / Spring Boot 3.2.5 / Maven multi-module reactor build. Root pom.xml manages shared dependencies: spring-boot-starter-webflux (Netty, Reactor), spring-boot-starter-web (Tomcat, Servlet MVC), Lombok, JUnit 5, dotenv-java. Telemetry uses non-blocking Reactor/WebFlux for high-throughput stream ingestion. Optimizer uses @EnableScheduling with Spring's TaskScheduler. Build: mvnw Maven wrapper. Module declarations registered under <modules> in root pom.xml.`
    },

    // ── BUILD / COMPILATION ────────────────────────────────────────────────
    {
      keys: ['build','compile','maven','mvnw','pom.xml','parent pom','module','multi module','reactor build','dependency','artifact'],
      response: `BUILD SYSTEM — Maven multi-module reactor. Root pom.xml: parent POM declaring Java 21 compiler target, Spring Boot 3.2.5 BOM, shared library versions (Lombok, JUnit 5, dotenv-java), and four submodule registrations (telemetry-service, analytics-service, optimizer-service, simulation-service). Each submodule has its own pom.xml inheriting from parent. Build all: ./mvnw clean install from core-engine/. Individual service: ./mvnw spring-boot:run -pl [service-name].`
    },

    // ── ENVIRONMENT / CONFIG ───────────────────────────────────────────────
    {
      keys: ['.env','environment','config','dotenv','tomtom_api_key','sumo_home','credentials','system property','@value'],
      response: `ENVIRONMENT CONFIGURATION — .env file at core-engine/ root contains: TOMTOM_API_KEY (TomTom Traffic API credentials) and SUMO_HOME (path to SUMO simulator installation for JNI/libtraci). TelemetryApplication.java reads .env via Dotenv.configure().load(), iterates all entries, and calls System.setProperty(key, value) before SpringApplication.run() — this ensures credentials are available to Spring's @Value injection at context initialization time. TelemetryConfig.java exposes these via @Value("\${TOMTOM_API_KEY:}") annotated fields.`
    },

    // ── HEALTH ENDPOINTS ───────────────────────────────────────────────────
    {
      keys: ['health','health check','health endpoint','/health','healthcontroller','status','alive','uptime'],
      response: `HEALTH ENDPOINTS — All four services expose a /health REST endpoint:\n• Telemetry (8081): Reactive WebFlux endpoint — returns JSON with credential load status from TelemetryConfig.\n• Analytics (8082): Servlet MVC endpoint — confirms Spring Servlet operations online.\n• Optimizer (8083): MVC endpoint — confirms scheduler status.\n• Simulation (8084): Triggers a mock initialization and step invocation on SumoInterfaceService to verify functional call chain, then returns simulation health status.`
    },

    // ── DEPLOYMENT / CLOUD ─────────────────────────────────────────────────
    {
      keys: ['deploy','deployment','cloud','cloud native','vercel','actuation','override','signal controller','api protocol','autonomous','latency'],
      response: `DEPLOYMENT MODEL — Cloud-native reactive microservices. Ingestion-to-actuation latency: <15ms per optimization cycle. Pipeline: stream normalization <3ms, LWR+MFD+KE parallel model evaluation <8ms, override matrix dispatch <4ms. Actuation: encrypted override commands transmitted directly to city signal controllers via secured API protocols, autonomously without human relay. Showroom landing page deployed on Vercel (showroom-landing-page/ subfolder). Core engine isolated in core-engine/ — never mixed with public presentation layer (Strategy A mono-repo).`
    },

    // ── SHOWROOM / WEBSITE ─────────────────────────────────────────────────
    {
      keys: ['website','showroom','landing page','html','css','js','frontend website','index.html','approach','mission','contact','progress','architecture page'],
      response: `PUBLIC SHOWROOM (showroom-landing-page/) — Five-page static presentation layer:\n• index.html: Hero + physics paradigm pillars + this AI Oracle terminal.\n• approach.html: Physics Engine spec — LWR, MFD, KE spec cards + animated SVG telemetry pipeline.\n• mission.html: Urban physics mandate — three impact vectors + objectives/constraints matrix.\n• progress.html: Solution Architecture — three-phase linear flowchart (Ingestion → Physics Engine → Actuation). No fake counters.\n• contact.html: Two secure intake channels — Municipal Partnership + Core Engineering recruitment.\nDesign: Space Grotesk/Mono fonts, #0B0C10 canvas, neon green #00FF66 accent. Canvas particle constellation on all pages.`
    },

    // ── STRATEGY A / REPO STRUCTURE ───────────────────────────────────────
    {
      keys: ['strategy a','mono repo','monorepo','repository','repo structure','core-engine','showroom-landing-page','separation','folder structure','directory'],
      response: `REPOSITORY ARCHITECTURE (Strategy A Mono-Repo) — The project uses a unified mono-repo with strict separation:\n• /core-engine/ — All proprietary Java microservices, Maven POM hierarchy, .env credentials, source code. Never deployed to Vercel.\n• /showroom-landing-page/ — Public static presentation layer only. Vercel deploys exclusively from this subdirectory.\nThis separation ensures the proprietary computational physics engine is never co-located with public presentation assets and Vercel's deployment boundary is contained to the showroom only.`
    },

    // ── HARDWARE GUARDRAIL ─────────────────────────────────────────────────
    {
      keys: ['hardware','sensor','camera','cctv','loop','ground loop','physical device','install','embedded','street level','infrastructure contract'],
      response: `[CLASSIFICATION CORRECTION] — GreenWave AI is 100% pure software. We have zero dependency on physical hardware of any kind — no cameras, no ground sensors, no inductive loops, no embedded controllers, no street-level devices. Our ingestion layer connects exclusively to digital GPS telemetry APIs and city network cloud endpoints via software-only API channels. If your evaluation includes any hardware budget line items for GreenWave integration, those can be eliminated entirely from the procurement equation.`
    },

    // ── SIMULATOR GUARDRAIL ────────────────────────────────────────────────
    {
      keys: ['simulator','sumo as product','digital twin product','demo','simulation product','game','visualization product','it a game'],
      response: `[CLASSIFICATION BOUNDARY] — The SUMO-based simulation service (port 8084) is GreenWave's INTERNAL mathematical validation testbed. SumoInterfaceService.java runs controlled vehicle physics to stress-test the LWR, MFD, and KE models against synthetic traffic scenarios before any live municipal deployment. It is categorically NOT the commercial product. The commercial product is the cloud-native physics engine executing autonomous signal override commands on live city telemetry at <15ms latency.`
    },

    // ── DASHBOARD GUARDRAIL ───────────────────────────────────────────────
    {
      keys: ['dashboard','user interface','portal','login','web app','consumer app','user account','sign up','sign in','register'],
      response: `[ARCHITECTURE GUARDRAIL] — GreenWave AI has no consumer-facing web application, no user dashboard, and no login system. This showroom terminal is an architecture presentation interface only. The commercial product operates exclusively at the infrastructure API layer — the physics engine issues autonomous signal override commands directly to municipal controller systems. City infrastructure engineers integrate at the API layer. Zero browser-based operator interfaces exist in the commercial product architecture.`
    },

    // ── TEAM / WHO BUILT THIS ─────────────────────────────────────────────
    {
      keys: ['who built','team','founder','creator','built by','who made','developer','built this'],
      response: `GREENWAVE AI — A deep-tech infrastructure intelligence startup. The core computational physics engine is built on Java 21 / Spring Boot / Project Reactor, architected as a cloud-native reactive microservice system. The engineering philosophy: replace static hardware-constrained signal paradigms with a pure-software physics layer that treats the urban road network as a single continuous kinetic system governed by fluid dynamics and thermodynamic network theory.`
    },

    // ── PROBLEM STATEMENT ─────────────────────────────────────────────────
    {
      keys: ['problem','gridlock','congestion','traffic jam','urban traffic','why','pain point','what problem','solving'],
      response: `THE PROBLEM — Urban gridlock is a computational optimization failure, not an infrastructure capacity problem. Legacy traffic management relies on static fixed-time signal controllers that are completely blind to real-time density fluctuations. The result: compression shockwaves propagate unchecked, freight corridors hemorrhage kinetic energy through stop-start cycles, and entire districts collapse into gridlock at critical density thresholds. This costs hundreds of billions annually in economic friction, excess emissions, and supply chain degradation. GreenWave dissolves these shockwaves before they form — in software, at cloud speed.`
    },

    // ── BUSINESS / INVESTOR ───────────────────────────────────────────────
    {
      keys: ['investor','invest','business model','revenue','market','municipal','city','partner','pilot','commercial'],
      response: `COMMERCIAL MODEL — GreenWave establishes deployment integrations with forward-thinking municipal infrastructure authorities via a pilot-first engagement model. The Municipal Partnership Intake channel (contact.html) accepts pilot proposals from city planners. Core differentiator: zero hardware procurement, zero infrastructure contracts, zero installation timelines — cities activate GreenWave through a cloud API integration against their existing data endpoints. This dramatically compresses the sales and deployment cycle versus legacy hardware-dependent traffic management vendors.`
    },

    // ── HOW IT WORKS (general) ────────────────────────────────────────────
    {
      keys: ['how does it work','how it works','explain how','process','workflow','pipeline','end to end','step by step'],
      response: `END-TO-END PIPELINE — Three autonomous phases:\n1. INGESTION: Cloud-to-cloud API connections consume digital GPS telemetry vectors from city mobility systems. Zero physical hardware. Sub-100ms ingestion cycle.\n2. PHYSICS ENGINE: LWR shockwave equations + MFD thermodynamic network modeling + KE conservation optimizer run in parallel on reactive JVM cloud instances. Converges into a signal override matrix in <15ms.\n3. ACTUATION: Override commands dispatch autonomously via encrypted API to city signal controllers. Shockwaves dissolved, freight momentum preserved, MFD boundaries held below saturation. Continuous autonomous loop, zero human relay.`
    },

    // ── GREETINGS / CONVERSATIONAL ───────────────────────────────────────
    {
      keys: ['hi','hello','hey','hii','hiii','hiiii','yo','sup','what\'s up','whats up','good morning','good evening','greetings','howdy'],
      response: `GW-CORE-ORACLE ONLINE — Hello. I am the GreenWave AI Architecture Oracle, embedded in this infrastructure showroom terminal. I have deep knowledge of every layer of the GreenWave AI system — from the LWR fluid dynamics physics engine to the Java microservice internals, signal optimization algorithms, and deployment architecture.\nAsk me anything about the project. Some starting points:\n  • "What is GreenWave AI?"\n  • "How does the physics engine work?"\n  • "Explain the microservice architecture"\n  • "How does adaptive signal control work?"`
    },
  ];

  /* ── SCORING MATCHER ─────────────────────────────────────────────────────
     Tokenize query, count keyword hits per KB entry, return highest scorer.
     Never returns "not found" — falls back to the greenwave overview.  */
  function queryLocal(input) {
    const q = input.toLowerCase().trim();

    // Check each entry
    let bestScore = 0;
    let bestEntry = KB[0]; // default: overview

    for (const entry of KB) {
      let score = 0;
      for (const key of entry.keys) {
        if (q.includes(key)) {
          score += key.split(' ').length; // multi-word phrases score higher
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    // If no keyword hit at all, give a smart default instead of "not indexed"
    if (bestScore === 0) {
      return `GW-CORE-ORACLE — Query received. For best results, ask about:\nPhysics models (LWR, MFD, kinetic) · Microservices (telemetry, analytics, optimizer, simulation) · Signal algorithms (adaptive, fixed, Max-Pressure) · Vehicle physics (car-following, stoplines, spawning) · Data pipeline (ingestion, actuation, latency) · Tech stack (Java, Spring Boot, WebFlux, Maven) · Repo structure (Strategy A, core-engine, showroom). Type "help" for the full index.`;
    }

    return bestEntry.response;
  }

  /* ── DOM REFS ────────────────────────────────────────────────────────────── */
  const historyEl = document.getElementById('terminal-history');
  const inputEl   = document.getElementById('terminal-input');
  if (!historyEl || !inputEl) return;

  /* ── TYPING ANIMATION ───────────────────────────────────────────────────── */
  function typeText(el, text, speed = 10) {
    return new Promise(resolve => {
      el.textContent = '';
      el.classList.add('typing-cursor');
      let i = 0;
      let buffer = '';

      function tick() {
        buffer += text[i];
        el.innerHTML = buffer
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
        i++;
        if (i < text.length) {
          // Faster for long responses to avoid user waiting forever
          const delay = text.length > 300 ? Math.max(3, speed - 5) : speed + (Math.random() * 6);
          setTimeout(tick, delay);
        } else {
          el.classList.remove('typing-cursor');
          resolve();
        }
      }
      setTimeout(tick, 50);
    });
  }

  /* ── APPEND LINE ────────────────────────────────────────────────────────── */
  function appendLine(cls, text, animate = false) {
    const div = document.createElement('div');
    div.className = `t-line t-line--${cls}`;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
    if (animate) {
      return typeText(div, text).then(() => { historyEl.scrollTop = historyEl.scrollHeight; });
    } else {
      div.innerHTML = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      return Promise.resolve();
    }
  }

  /* ── GEMINI LIVE CALL ────────────────────────────────────────────────────── */
  async function queryGemini(userInput) {
    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userInput }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 500,
        topP: 0.85,
      }
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API ${response.status}: ${errBody.slice(0, 120)}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '[No response returned from model]';
  }

  /* ── SUBMIT HANDLER ─────────────────────────────────────────────────────── */
  let isProcessing = false;

  async function handleSubmit() {
    if (isProcessing) return;
    const raw = inputEl.value.trim();
    if (!raw) return;

    inputEl.value = '';
    isProcessing = true;
    inputEl.disabled = true;
    inputEl.placeholder = 'Processing query...';

    await appendLine('user', raw);

    // Thinking indicator
    const thinkDiv = document.createElement('div');
    thinkDiv.className = 't-line t-line--sys typing-cursor';
    thinkDiv.textContent = 'Querying architecture oracle';
    historyEl.appendChild(thinkDiv);
    historyEl.scrollTop = historyEl.scrollHeight;

    try {
      let responseText;

      if (GEMINI_API_KEY) {
        responseText = await queryGemini(raw);
      } else {
        await new Promise(r => setTimeout(r, 400));
        responseText = queryLocal(raw);
      }

      thinkDiv.remove();

      const isGuardrail = responseText.startsWith('[');
      await appendLine(isGuardrail ? 'warn' : 'sys', responseText, true);

    } catch (err) {
      thinkDiv.remove();
      // Detect quota/rate-limit errors — show a clean message, not raw JSON
      const is429 = err.message.includes('429');
      if (is429) {
        await appendLine('sys', 'API quota reached — switching to local specification deck.', false);
      } else {
        await appendLine('warn', `ORACLE_ERROR :: ${err.message.split(':')[0]}. Using local deck.`, true);
      }
      const fallback = queryLocal(raw);
      await appendLine('sys', fallback, true);
    }

    isProcessing = false;
    inputEl.disabled = false;
    inputEl.placeholder = 'Query the architecture...';
    inputEl.focus();
  }

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSubmit();
  });

  /* ── BOOT SEQUENCE ──────────────────────────────────────────────────────── */
  const BOOT = GEMINI_API_KEY
    ? [
        'GW-CORE-ORACLE v4.0 initializing...',
        'Gemini 2.0 Flash AI: ONLINE',
        'Full project specification deck loaded',
        'Architecture guardrails: ACTIVE',
        'Mode: LIVE AI — Full technical oracle operational.',
        'Ask anything about GreenWave AI architecture, physics models, or codebase.',
      ]
    : [
        'GW-CORE-ORACLE v4.0 initializing...',
        'Loading full project specification deck...',
        'Physics models: LWR · MFD · KE · Adaptive Signal Control',
        'Microservice map: Telemetry · Analytics · Optimizer · Simulation',
        'Architecture guardrails: ACTIVE',
        'Mode: LOCAL ORACLE — Ask anything about the GreenWave AI project.',
      ];

  async function boot() {
    for (const line of BOOT) {
      await appendLine('sys', line, true);
      await new Promise(r => setTimeout(r, 80));
    }
    inputEl.focus();
  }

  boot();

})();
