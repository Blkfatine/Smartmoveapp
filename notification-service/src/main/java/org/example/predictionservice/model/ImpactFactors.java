package org.example.predictionservice.model;

/**
 * Represents the impact factors contributing to the prediction.
 * Each factor is a percentage (0-100) representing its contribution.
 */
public class ImpactFactors {
    private int traffic; // Traffic impact percentage
    private int weather; // Weather impact percentage
    private int incidents; // Incidents impact percentage
    private int peakHour; // Peak hour impact percentage

    public ImpactFactors() {}

    public ImpactFactors(int traffic, int weather, int incidents, int peakHour) {
        this.traffic = traffic;
        this.weather = weather;
        this.incidents = incidents;
        this.peakHour = peakHour;
    }

    public int getTraffic() { return traffic; }
    public void setTraffic(int traffic) { this.traffic = traffic; }
    public int getWeather() { return weather; }
    public void setWeather(int weather) { this.weather = weather; }
    public int getIncidents() { return incidents; }
    public void setIncidents(int incidents) { this.incidents = incidents; }
    public int getPeakHour() { return peakHour; }
    public void setPeakHour(int peakHour) { this.peakHour = peakHour; }
}
