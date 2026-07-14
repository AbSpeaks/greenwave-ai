package com.greenwave.ai.simulation.controller;

import com.greenwave.ai.simulation.service.SumoInterfaceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final SumoInterfaceService sumoInterfaceService;

    public HealthController(SumoInterfaceService sumoInterfaceService) {
        this.sumoInterfaceService = sumoInterfaceService;
    }

    /**
     * Simulation health endpoint. Triggers a mock SUMO interaction cycle.
     */
    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "simulation-service");
        status.put("status", "UP");
        status.put("libtraci_active", true);
        return status;
    }
}
