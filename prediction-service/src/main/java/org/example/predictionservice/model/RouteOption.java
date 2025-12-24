package org.example.predictionservice.model;


import java.util.List;

public class RouteOption {
    private double durationMinutes;
    private double distanceKm;
    private double trafficDelayMinutes;
    private String description; // e.g., "Alternative 1", "Fastest", "Shortest"
    private String riskLevel;
    private List<Object> geometry; // Points for visualization

    public RouteOption() {}

    public RouteOption(double durationMinutes, double distanceKm, double trafficDelayMinutes, String description, String riskLevel, List<Object> geometry) {
        this.durationMinutes = durationMinutes;
        this.distanceKm = distanceKm;
        this.trafficDelayMinutes = trafficDelayMinutes;
        this.description = description;
        this.riskLevel = riskLevel;
        this.geometry = geometry;
    }

    public double getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(double durationMinutes) { this.durationMinutes = durationMinutes; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public double getTrafficDelayMinutes() { return trafficDelayMinutes; }
    public void setTrafficDelayMinutes(double trafficDelayMinutes) { this.trafficDelayMinutes = trafficDelayMinutes; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public List<Object> getGeometry() { return geometry; }
    public void setGeometry(List<Object> geometry) { this.geometry = geometry; }

    // Derived metric for easy sorting
    public double getTotalScore() {
        // Less is better. Prioritize duration.
        return durationMinutes;
    }

    public static RouteOptionBuilder builder() {
        return new RouteOptionBuilder();
    }

    public static class RouteOptionBuilder {
        private double durationMinutes;
        private double distanceKm;
        private double trafficDelayMinutes;
        private String description;
        private String riskLevel;
        private List<Object> geometry;

        public RouteOptionBuilder durationMinutes(double durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public RouteOptionBuilder distanceKm(double distanceKm) { this.distanceKm = distanceKm; return this; }
        public RouteOptionBuilder trafficDelayMinutes(double trafficDelayMinutes) { this.trafficDelayMinutes = trafficDelayMinutes; return this; }
        public RouteOptionBuilder description(String description) { this.description = description; return this; }
        public RouteOptionBuilder riskLevel(String riskLevel) { this.riskLevel = riskLevel; return this; }
        public RouteOptionBuilder geometry(List<Object> geometry) { this.geometry = geometry; return this; }

        public RouteOption build() {
            return new RouteOption(durationMinutes, distanceKm, trafficDelayMinutes, description, riskLevel, geometry);
        }
    }
}
