package com.greenwave.ai.telemetry.controller;

import com.greenwave.ai.telemetry.config.TelemetryConfig;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final TelemetryConfig telemetryConfig;

    public HealthController(TelemetryConfig telemetryConfig) {
        this.telemetryConfig = telemetryConfig;
    }

    /**
     * WebFlux Reactive health check endpoint.
     */
    @GetMapping("/health")
    public Mono<Map<String, Object>> healthCheck() {
        return Mono.fromCallable(() -> {
            Map<String, Object> status = new HashMap<>();
            status.put("service", "telemetry-service");
            status.put("status", "UP");
            status.put("tomtom_configured", telemetryConfig.getTomTomApiKey() != null && !telemetryConfig.getTomTomApiKey().isEmpty());
            status.put("sumo_home", telemetryConfig.getSumoHome());
            return status;
        });
    }
}
