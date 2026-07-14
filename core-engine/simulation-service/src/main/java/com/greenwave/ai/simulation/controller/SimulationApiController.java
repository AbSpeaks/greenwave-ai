package com.greenwave.ai.simulation.controller;

import com.greenwave.ai.simulation.service.SumoInterfaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
public class SimulationApiController {

    private static final Logger log = LoggerFactory.getLogger(SimulationApiController.class);

    private final SumoInterfaceService sumoInterfaceService;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final ScheduledExecutorService executorService;

    public SimulationApiController(SumoInterfaceService sumoInterfaceService) {
        this.sumoInterfaceService = sumoInterfaceService;
        
        // Background thread steps the physics and streams telemetry every 100ms
        this.executorService = Executors.newSingleThreadScheduledExecutor();
        this.executorService.scheduleAtFixedRate(this::runStepAndStream, 0, 100, TimeUnit.MILLISECONDS);
    }

    private void runStepAndStream() {
        try {
            // Update simulation mechanics
            sumoInterfaceService.step();

            if (emitters.isEmpty()) return;

            // Fetch the updated position coordinates
            Map<String, Object> state = sumoInterfaceService.getSimulationState();

            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    // Stream coordinates as structured event named 'simulation-state'
                    emitter.send(SseEmitter.event()
                            .name("simulation-state")
                            .data(state));
                } catch (IOException | IllegalStateException e) {
                    deadEmitters.add(emitter);
                }
            }
            emitters.removeAll(deadEmitters);
        } catch (Exception e) {
            log.error("Exception in active simulation loop", e);
        }
    }

    /**
     * Streams real-time positions, light states, and metrics as Server-Sent Events.
     */
    @GetMapping(value = "/api/simulation/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSimulation() {
        SseEmitter emitter = new SseEmitter(600_000L); // 10 minute socket timeout
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        return emitter;
    }

    /**
     * Command: Starts or Resumes the simulation loops.
     */
    @PostMapping("/api/simulation/start")
    public String startSimulation() {
        sumoInterfaceService.start();
        return "STARTED";
    }

    /**
     * Command: Pauses the simulation loops.
     */
    @PostMapping("/api/simulation/stop")
    public String stopSimulation() {
        sumoInterfaceService.stop();
        return "PAUSED";
    }

    /**
     * Command: Resets the entire simulation and metrics tracker.
     */
    @PostMapping("/api/simulation/reset")
    public String resetSimulation() {
        sumoInterfaceService.reset();
        return "RESET";
    }

    /**
     * Command: Dynamic configs update (e.g. signal control logic, vehicle arrival rates).
     */
    @PostMapping("/api/simulation/config")
    public String updateConfig(@RequestParam String mode, @RequestParam double rate) {
        sumoInterfaceService.updateConfig(mode, rate);
        return "CONFIG_UPDATED";
    }
}
