package org.example.predictionservice.model;



import java.time.LocalDateTime;

public class Prediction {
    private String origin;
    private String destination;
    private double predictedDuration; // minutes
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String timestamp; // String for easier JSON serialization

    public Prediction() {}

    public Prediction(String origin, String destination, double predictedDuration, String riskLevel, String timestamp) {
        this.origin = origin;
        this.destination = destination;
        this.predictedDuration = predictedDuration;
        this.riskLevel = riskLevel;
        this.timestamp = timestamp;
    }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public double getPredictedDuration() { return predictedDuration; }
    public void setPredictedDuration(double predictedDuration) { this.predictedDuration = predictedDuration; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
