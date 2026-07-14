package com.greenwave.ai.telemetry;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TelemetryApplication {

    public static void main(String[] args) {
        // Load environment variables from the root .env file
        Dotenv dotenv = Dotenv.configure()
                .directory("../")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        // Set loaded env variables as JVM System properties for Spring environment mapping
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(TelemetryApplication.class, args);
    }
}
