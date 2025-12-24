package org.example.predictionservice.model;



public class PredictionRequest {
    private String origin;
    private String destination;
    private String departureDate; // YYYY-MM-DD format
    private String departureTime; // HH:mm format
    private String transportMode; // driving, transit, walking

    public PredictionRequest() {}

    public PredictionRequest(String origin, String destination, String departureDate, String departureTime, String transportMode) {
        this.origin = origin;
        this.destination = destination;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.transportMode = transportMode;
    }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDepartureDate() { return departureDate; }
    public void setDepartureDate(String departureDate) { this.departureDate = departureDate; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public static PredictionRequestBuilder builder() {
        return new PredictionRequestBuilder();
    }

    public static class PredictionRequestBuilder {
        private String origin;
        private String destination;
        private String departureDate;
        private String departureTime;
        private String transportMode;

        public PredictionRequestBuilder origin(String origin) { this.origin = origin; return this; }
        public PredictionRequestBuilder destination(String destination) { this.destination = destination; return this; }
        public PredictionRequestBuilder departureDate(String departureDate) { this.departureDate = departureDate; return this; }
        public PredictionRequestBuilder departureTime(String departureTime) { this.departureTime = departureTime; return this; }
        public PredictionRequestBuilder transportMode(String transportMode) { this.transportMode = transportMode; return this; }

        public PredictionRequest build() {
            return new PredictionRequest(origin, destination, departureDate, departureTime, transportMode);
        }
    }
}
