package org.example.predictionservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RouteOption {
    private double durationMinutes;
    private double distanceKm;
    private double trafficDelayMinutes;
    private String description; // e.g., "Alternative 1", "Fastest", "Shortest"
    private String riskLevel;
    private List<Object> geometry; // Points for visualization

    // Derived metric for easy sorting
    public double getTotalScore() {
        // Less is better. Prioritize duration.
        return durationMinutes;
    }
}
