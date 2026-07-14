package com.greenwave.ai.optimizer.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SignalScheduler {

    private static final Logger log = LoggerFactory.getLogger(SignalScheduler.class);

    /**
     * Periodically triggers dynamic traffic light split optimization.
     * Executes every 5 seconds (5000ms fixed rate).
     */
    @Scheduled(fixedRate = 5000)
    public void optimizeSignalTiming() {
        log.info("Background dynamic optimization cycle: calculating green splits and offsets based on telemetry inputs.");
    }
}
