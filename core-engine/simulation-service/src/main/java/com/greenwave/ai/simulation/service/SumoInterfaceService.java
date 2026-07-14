package com.greenwave.ai.simulation.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SumoInterfaceService {

    private static final Logger log = LoggerFactory.getLogger(SumoInterfaceService.class);

    // Simulation settings
    private volatile boolean running = false;
    private String signalMode = "FIXED"; // "FIXED" or "ADAPTIVE"
    private double arrivalRate = 12.0;   // vehicles per minute per lane

    // Simulation state
    private final List<Vehicle> vehicles = new CopyOnWriteArrayList<>();
    private final Random random = new Random();
    private int tickCount = 0;

    // Traffic signal states
    // 0: NS_GREEN (EW_RED), 1: NS_YELLOW (EW_RED), 2: EW_GREEN (NS_RED), 3: EW_YELLOW (NS_RED)
    private int signalPhase = 0; 
    private int phaseTime = 0;

    // Metrics
    private int totalVehiclesSpawned = 0;
    private int totalVehiclesPassed = 0;
    private long totalWaitTime = 0; // accumulated wait steps
    private double averageDelay = 0.0;
    private int queueNS = 0;
    private int queueEW = 0;

    // Consts
    private static final double MAX_SPEED = 4.0; // pixels per step
    private static final double SAFE_DISTANCE = 35.0; // pixels
    private static final int WIDTH = 600;
    private static final int HEIGHT = 600;

    // Stoplines
    private static final int STOPLINE_SB = 240; // Southbound stopline (travels y=0 -> y=600)
    private static final int STOPLINE_NB = 360; // Northbound stopline (travels y=600 -> y=0)
    private static final int STOPLINE_EB = 240; // Eastbound stopline (travels x=0 -> x=600)
    private static final int STOPLINE_WB = 360; // Westbound stopline (travels x=600 -> x=0)

    public static class Vehicle {
        public String id;
        public double x;
        public double y;
        public double speed;
        public double angle;
        public String direction;
        public int waitTime;
        public boolean crossedStopline;

        public Vehicle(String id, double x, double y, String direction, double angle) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.angle = angle;
            this.speed = MAX_SPEED;
            this.waitTime = 0;
            this.crossedStopline = false;
        }
    }

    public synchronized void start() {
        if (!running) {
            running = true;
            log.info("Simulation thread started.");
        }
    }

    public synchronized void stop() {
        running = false;
        log.info("Simulation thread paused.");
    }

    public synchronized void reset() {
        vehicles.clear();
        tickCount = 0;
        signalPhase = 0;
        phaseTime = 0;
        totalVehiclesSpawned = 0;
        totalVehiclesPassed = 0;
        totalWaitTime = 0;
        averageDelay = 0.0;
        queueNS = 0;
        queueEW = 0;
        log.info("Simulation state reset.");
    }

    public synchronized void updateConfig(String mode, double rate) {
        this.signalMode = mode;
        this.arrivalRate = rate;
        log.info("Simulation config updated: mode={}, rate={}", mode, rate);
    }

    // This method is called every 100ms by the scheduler/controller loop to step the physics
    public synchronized void step() {
        if (!running) return;

        tickCount++;
        phaseTime++;

        // 1. Spawning Logic
        // Arrival rate is vehicles/minute. 10 ticks = 1 second. 600 ticks = 1 minute.
        // Probability of spawning a vehicle per tick = (arrivalRate / 60.0) / 10.0 = arrivalRate / 600.0
        double spawnProbability = arrivalRate / 600.0;
        if (random.nextDouble() < spawnProbability) {
            spawnVehicle("SOUTHBOUND");
        }
        if (random.nextDouble() < spawnProbability) {
            spawnVehicle("NORTHBOUND");
        }
        if (random.nextDouble() < spawnProbability) {
            spawnVehicle("EASTBOUND");
        }
        if (random.nextDouble() < spawnProbability) {
            spawnVehicle("WESTBOUND");
        }

        // 2. Traffic Signal Controller Logic
        updateSignals();

        // 3. Queue calculation (reset and recalculate)
        int currentQueueNS = 0;
        int currentQueueEW = 0;

        // 4. Update Vehicle Physics
        List<Vehicle> toRemove = new ArrayList<>();

        for (Vehicle v : vehicles) {
            // Find distance to vehicle ahead in the same lane
            double distAhead = getDistanceToVehicleAhead(v);
            double stoplineDist = getDistanceToStopline(v);
            boolean lightAllows = lightAllowsPass(v);

            // Car-following & light logic
            double targetSpeed = MAX_SPEED;

            // Slow down if there's a car ahead
            if (distAhead < SAFE_DISTANCE) {
                if (distAhead < 15.0) {
                    targetSpeed = 0;
                } else {
                    targetSpeed = Math.max(0, (distAhead - 15.0) / (SAFE_DISTANCE - 15.0) * MAX_SPEED);
                }
            }

            // Slow down for stopline if light is red/yellow
            if (!v.crossedStopline && stoplineDist > 0 && stoplineDist < 120.0 && !lightAllows) {
                if (stoplineDist < 10.0) {
                    targetSpeed = 0;
                } else {
                    double stopSpeed = (stoplineDist - 10.0) / 110.0 * MAX_SPEED;
                    targetSpeed = Math.min(targetSpeed, stopSpeed);
                }
            }

            // Apply speed change smoothly
            if (v.speed < targetSpeed) {
                v.speed = Math.min(MAX_SPEED, v.speed + 0.2);
            } else if (v.speed > targetSpeed) {
                v.speed = Math.max(0, v.speed - 0.4);
            }

            // Accumulate wait time if stopped
            if (v.speed < 0.5) {
                v.waitTime++;
                totalWaitTime++;
                if (!v.crossedStopline) {
                    if (v.direction.equals("NORTHBOUND") || v.direction.equals("SOUTHBOUND")) {
                        currentQueueNS++;
                    } else {
                        currentQueueEW++;
                    }
                }
            }

            // Move vehicle
            moveVehicle(v);

            // Check if crossed stopline
            checkCrossedStopline(v);

            // Check boundaries for deletion
            if (isOutOfBounds(v)) {
                toRemove.add(v);
                totalVehiclesPassed++;
            }
        }

        vehicles.removeAll(toRemove);

        // Update active queues
        queueNS = currentQueueNS;
        queueEW = currentQueueEW;

        // Calculate average delay
        if (totalVehiclesPassed > 0) {
            averageDelay = (double) totalWaitTime / 10.0 / (totalVehiclesPassed + vehicles.size());
        } else if (!vehicles.isEmpty()) {
            averageDelay = (double) totalWaitTime / 10.0 / vehicles.size();
        }
    }

    private void spawnVehicle(String direction) {
        totalVehiclesSpawned++;
        String id = "veh_" + totalVehiclesSpawned;
        Vehicle v;

        switch (direction) {
            case "SOUTHBOUND":
                v = new Vehicle(id, 285.0, 0.0, direction, 180.0);
                break;
            case "NORTHBOUND":
                v = new Vehicle(id, 315.0, (double) HEIGHT, direction, 0.0);
                break;
            case "EASTBOUND":
                v = new Vehicle(id, 0.0, 285.0, direction, 90.0);
                break;
            case "WESTBOUND":
                v = new Vehicle(id, (double) WIDTH, 315.0, direction, 270.0);
                break;
            default:
                return;
        }

        // Only spawn if lane entrance is clear
        boolean clear = true;
        for (Vehicle other : vehicles) {
            if (other.direction.equals(direction)) {
                double dist = 0;
                if (direction.equals("SOUTHBOUND")) dist = other.y;
                else if (direction.equals("NORTHBOUND")) dist = HEIGHT - other.y;
                else if (direction.equals("EASTBOUND")) dist = other.x;
                else if (direction.equals("WESTBOUND")) dist = WIDTH - other.x;
                
                if (dist < SAFE_DISTANCE) {
                    clear = false;
                    break;
                }
            }
        }

        if (clear) {
            vehicles.add(v);
        }
    }

    private void updateSignals() {
        if (signalMode.equals("FIXED")) {
            if (signalPhase == 0 || signalPhase == 2) { // Green phases
                if (phaseTime >= 150) {
                    signalPhase = (signalPhase + 1) % 4;
                    phaseTime = 0;
                }
            } else { // Yellow phases
                if (phaseTime >= 30) {
                    signalPhase = (signalPhase + 1) % 4;
                    phaseTime = 0;
                }
            }
        } else {
            // ADAPTIVE Max-Pressure
            if (signalPhase == 0) { // NS is currently Green
                if (phaseTime >= 50) { // Minimum green = 5s
                    if ((queueEW - queueNS >= 2) || phaseTime >= 250) {
                        signalPhase = 1; // transition to NS_YELLOW
                        phaseTime = 0;
                    }
                }
            } else if (signalPhase == 1) { // NS is Yellow
                if (phaseTime >= 30) { // Yellow = 3s
                    signalPhase = 2; // transition to EW_GREEN
                    phaseTime = 0;
                }
            } else if (signalPhase == 2) { // EW is Green
                if (phaseTime >= 50) { // Minimum green = 5s
                    if ((queueNS - queueEW >= 2) || phaseTime >= 250) {
                        signalPhase = 3; // transition to EW_YELLOW
                        phaseTime = 0;
                    }
                }
            } else if (signalPhase == 3) { // EW is Yellow
                if (phaseTime >= 30) { // Yellow = 3s
                    signalPhase = 0; // transition to NS_GREEN
                    phaseTime = 0;
                }
            }
        }
    }

    private boolean lightAllowsPass(Vehicle v) {
        if (v.direction.equals("SOUTHBOUND") || v.direction.equals("NORTHBOUND")) {
            return signalPhase == 0; 
        } else {
            return signalPhase == 2; 
        }
    }

    private double getDistanceToVehicleAhead(Vehicle v) {
        double minDist = Double.MAX_VALUE;
        for (Vehicle other : vehicles) {
            if (other == v || !other.direction.equals(v.direction)) continue;

            double dist = Double.MAX_VALUE;
            switch (v.direction) {
                case "SOUTHBOUND":
                    if (other.y > v.y) dist = other.y - v.y;
                    break;
                case "NORTHBOUND":
                    if (other.y < v.y) dist = v.y - other.y;
                    break;
                case "EASTBOUND":
                    if (other.x > v.x) dist = other.x - v.x;
                    break;
                case "WESTBOUND":
                    if (other.x < v.x) dist = v.x - other.x;
                    break;
            }
            if (dist > 0 && dist < minDist) {
                minDist = dist;
            }
        }
        return minDist;
    }

    private double getDistanceToStopline(Vehicle v) {
        switch (v.direction) {
            case "SOUTHBOUND":
                return STOPLINE_SB - v.y;
            case "NORTHBOUND":
                return v.y - STOPLINE_NB;
            case "EASTBOUND":
                return STOPLINE_EB - v.x;
            case "WESTBOUND":
                return v.x - STOPLINE_WB;
            default:
                return -1;
        }
    }

    private void moveVehicle(Vehicle v) {
        switch (v.direction) {
            case "SOUTHBOUND":
                v.y += v.speed;
                break;
            case "NORTHBOUND":
                v.y -= v.speed;
                break;
            case "EASTBOUND":
                v.x += v.speed;
                break;
            case "WESTBOUND":
                v.x -= v.speed;
                break;
        }
    }

    private void checkCrossedStopline(Vehicle v) {
        if (v.crossedStopline) return;

        switch (v.direction) {
            case "SOUTHBOUND":
                if (v.y > STOPLINE_SB) v.crossedStopline = true;
                break;
            case "NORTHBOUND":
                if (v.y < STOPLINE_NB) v.crossedStopline = true;
                break;
            case "EASTBOUND":
                if (v.x > STOPLINE_EB) v.crossedStopline = true;
                break;
            case "WESTBOUND":
                if (v.x < STOPLINE_WB) v.crossedStopline = true;
                break;
        }
    }

    private boolean isOutOfBounds(Vehicle v) {
        return v.x < 0 || v.x > WIDTH || v.y < 0 || v.y > HEIGHT;
    }

    public String getNsLightColor() {
        if (signalPhase == 0) return "GREEN";
        if (signalPhase == 1) return "YELLOW";
        return "RED";
    }

    public String getEwLightColor() {
        if (signalPhase == 2) return "GREEN";
        if (signalPhase == 3) return "YELLOW";
        return "RED";
    }

    // Expose full state data mapping to be sent over SSE
    public Map<String, Object> getSimulationState() {
        Map<String, Object> state = new HashMap<>();
        state.put("running", running);
        state.put("signalMode", signalMode);
        state.put("arrivalRate", arrivalRate);
        state.put("signalPhase", signalPhase);
        state.put("nsLightColor", getNsLightColor());
        state.put("ewLightColor", getEwLightColor());
        state.put("queueNS", queueNS);
        state.put("queueEW", queueEW);
        state.put("totalVehiclesSpawned", totalVehiclesSpawned);
        state.put("totalVehiclesPassed", totalVehiclesPassed);
        state.put("averageDelay", Double.parseDouble(String.format("%.2f", averageDelay)));
        
        List<Map<String, Object>> vehicleList = new ArrayList<>();
        for (Vehicle v : vehicles) {
            Map<String, Object> vm = new HashMap<>();
            vm.put("id", v.id);
            vm.put("x", v.x);
            vm.put("y", v.y);
            vm.put("speed", v.speed);
            vm.put("angle", v.angle);
            vm.put("direction", v.direction);
            vehicleList.add(vm);
        }
        state.put("vehicles", vehicleList);
        return state;
    }
}
