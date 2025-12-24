package org.example.predictionservice.model;



public class TripUpdateEvent {
    private Long tripId;
    private String userId;
    private double oldDuration;
    private double newDuration;
    private String reason;
    private String origin;
    private String destination;

    public TripUpdateEvent() {}

    public TripUpdateEvent(Long tripId, String userId, double oldDuration, double newDuration, String reason, String origin, String destination) {
        this.tripId = tripId;
        this.userId = userId;
        this.oldDuration = oldDuration;
        this.newDuration = newDuration;
        this.reason = reason;
        this.origin = origin;
        this.destination = destination;
    }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public double getOldDuration() { return oldDuration; }
    public void setOldDuration(double oldDuration) { this.oldDuration = oldDuration; }
    public double getNewDuration() { return newDuration; }
    public void setNewDuration(double newDuration) { this.newDuration = newDuration; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public static TripUpdateEventBuilder builder() {
        return new TripUpdateEventBuilder();
    }

    public static class TripUpdateEventBuilder {
        private Long tripId;
        private String userId;
        private double oldDuration;
        private double newDuration;
        private String reason;
        private String origin;
        private String destination;

        public TripUpdateEventBuilder tripId(Long tripId) { this.tripId = tripId; return this; }
        public TripUpdateEventBuilder userId(String userId) { this.userId = userId; return this; }
        public TripUpdateEventBuilder oldDuration(double oldDuration) { this.oldDuration = oldDuration; return this; }
        public TripUpdateEventBuilder newDuration(double newDuration) { this.newDuration = newDuration; return this; }
        public TripUpdateEventBuilder reason(String reason) { this.reason = reason; return this; }
        public TripUpdateEventBuilder origin(String origin) { this.origin = origin; return this; }
        public TripUpdateEventBuilder destination(String destination) { this.destination = destination; return this; }

        public TripUpdateEvent build() {
            return new TripUpdateEvent(tripId, userId, oldDuration, newDuration, reason, origin, destination);
        }
    }
}
