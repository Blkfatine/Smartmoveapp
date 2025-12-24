package org.example.predictionservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


@Entity
public class MonitoredTrip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String origin;
    private String destination;
    private double originalDuration; // Minutes
    private double lastDuration; // Minutes
    private String userId; // Or deviceId
    private boolean isActive;

    public MonitoredTrip() {}

    public MonitoredTrip(Long id, String origin, String destination, double originalDuration, double lastDuration, String userId, boolean isActive) {
        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.originalDuration = originalDuration;
        this.lastDuration = lastDuration;
        this.userId = userId;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public double getOriginalDuration() { return originalDuration; }
    public void setOriginalDuration(double originalDuration) { this.originalDuration = originalDuration; }
    public double getLastDuration() { return lastDuration; }
    public void setLastDuration(double lastDuration) { this.lastDuration = lastDuration; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public static MonitoredTripBuilder builder() {
        return new MonitoredTripBuilder();
    }

    public static class MonitoredTripBuilder {
        private String origin;
        private String destination;
        private double originalDuration;
        private double lastDuration;
        private String userId;
        private boolean isActive;

        public MonitoredTripBuilder origin(String origin) { this.origin = origin; return this; }
        public MonitoredTripBuilder destination(String destination) { this.destination = destination; return this; }
        public MonitoredTripBuilder originalDuration(double originalDuration) { this.originalDuration = originalDuration; return this; }
        public MonitoredTripBuilder lastDuration(double lastDuration) { this.lastDuration = lastDuration; return this; }
        public MonitoredTripBuilder userId(String userId) { this.userId = userId; return this; }
        public MonitoredTripBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }

        public MonitoredTrip build() {
            MonitoredTrip trip = new MonitoredTrip();
            trip.setOrigin(origin);
            trip.setDestination(destination);
            trip.setOriginalDuration(originalDuration);
            trip.setLastDuration(lastDuration);
            trip.setUserId(userId);
            trip.setActive(isActive);
            return trip;
        }
    }
}


