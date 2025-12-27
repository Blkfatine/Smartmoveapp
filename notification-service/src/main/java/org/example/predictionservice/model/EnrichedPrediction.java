package org.example.predictionservice.model;

import java.util.List;

/**
 * Enriched prediction response with complete analysis data.
 * Includes impact factors, explanations, and AI recommendations.
 */
public class EnrichedPrediction {

    // Basic trip info
    private String origin;
    private String destination;
    private String timestamp;

    // Duration data
    private double predictedDuration; // Final calculated duration in minutes
    private double baseDuration; // Base duration in minutes
    private double distanceKm; // Distance in kilometers
    private String durationText; // Formatted duration "X h Y min" or "Y min"

    // Time info
    private String departureTime; // HH:mm format
    private String arrivalTime; // HH:mm format (calculated)

    // Risk assessment
    private String riskLevel; // LOW, MEDIUM, HIGH
    private int riskScore; // 0-100 score

    // Impact factors
    private ImpactFactors impactFactors;

    // Condition flags
    private boolean isPeakHour;
    private boolean hasIncidents;
    private String weatherCondition;
    private String trafficCondition;

    // Explanations
    private List<String> explanationPoints;
    private String aiRecommendation;

    // Additional weather details
    private Double temperature;
    private Double visibility;
    private Double windSpeed;

    // Incident details
    private int incidentCount;
    private String incidentSeverity;

    // SmartMove Intelligence
    private double confidenceScore; // 0.0 to 1.0
    private double recommendationOffset; // Minutes saved by following advice

    // Route Geometry
    private List<Object> routeGeometry; // List of {lat, lon} points

    // Alternatives
    private RouteOption recommendedRoute;
    private List<RouteOption> alternativeRoutes;

    public EnrichedPrediction() {}

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public double getBaseDuration() { return baseDuration; }
    public void setBaseDuration(double baseDuration) { this.baseDuration = baseDuration; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }
    public ImpactFactors getImpactFactors() { return impactFactors; }
    public void setImpactFactors(ImpactFactors impactFactors) { this.impactFactors = impactFactors; }
    public boolean isPeakHour() { return isPeakHour; }
    public void setPeakHour(boolean peakHour) { isPeakHour = peakHour; }
    public boolean isHasIncidents() { return hasIncidents; }
    public void setHasIncidents(boolean hasIncidents) { this.hasIncidents = hasIncidents; }
    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }
    public String getTrafficCondition() { return trafficCondition; }
    public void setTrafficCondition(String trafficCondition) { this.trafficCondition = trafficCondition; }
    public List<String> getExplanationPoints() { return explanationPoints; }
    public void setExplanationPoints(List<String> explanationPoints) { this.explanationPoints = explanationPoints; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getVisibility() { return visibility; }
    public void setVisibility(Double visibility) { this.visibility = visibility; }
    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    public int getIncidentCount() { return incidentCount; }
    public void setIncidentCount(int incidentCount) { this.incidentCount = incidentCount; }
    public String getIncidentSeverity() { return incidentSeverity; }
    public void setIncidentSeverity(String incidentSeverity) { this.incidentSeverity = incidentSeverity; }
    public double getRecommendationOffset() { return recommendationOffset; }
    public void setRecommendationOffset(double recommendationOffset) { this.recommendationOffset = recommendationOffset; }
    public List<Object> getRouteGeometry() { return routeGeometry; }
    public void setRouteGeometry(List<Object> routeGeometry) { this.routeGeometry = routeGeometry; }
    public RouteOption getRecommendedRoute() { return recommendedRoute; }
    public void setRecommendedRoute(RouteOption recommendedRoute) { this.recommendedRoute = recommendedRoute; }
    public List<RouteOption> getAlternativeRoutes() { return alternativeRoutes; }
    public void setAlternativeRoutes(List<RouteOption> alternativeRoutes) { this.alternativeRoutes = alternativeRoutes; }
    public void setPredictedDuration(double predictedDuration) { this.predictedDuration = predictedDuration; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public void setDurationText(String durationText) { this.durationText = durationText; }
    public void setAiRecommendation(String aiRecommendation) { this.aiRecommendation = aiRecommendation; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public double getPredictedDuration() { return predictedDuration; }
    public String getRiskLevel() { return riskLevel; }
    public String getTimestamp() { return timestamp; }
    public String getDurationText() { return durationText; }
    public String getAiRecommendation() { return aiRecommendation; }
    public double getConfidenceScore() { return confidenceScore; }
}
