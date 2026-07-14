package com.greenwave.ai.telemetry.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TelemetryConfig {

    /**
     * Binds TOMTOM_API_KEY populated from dotenv/system environment.
     */
    @Value("${TOMTOM_API_KEY:}")
    private String tomTomApiKey;

    /**
     * Binds SUMO_HOME path populated from dotenv/system environment.
     */
    @Value("${SUMO_HOME:}")
    private String sumoHome;

    public String getTomTomApiKey() {
        return tomTomApiKey;
    }

    public String getSumoHome() {
        return sumoHome;
    }
}
