package org.example.predictionservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Structured analysis of weather impact on travel.
 * Used to provide traceable and explainable results to the user.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeatherImpactAnalysis {

    /**
     * Modifier value used for calculation (e.g., 0.15 for +15% duration).
     * Internal use for physics calculation.
     */
    private double impactModifier;

    /**
     * Percentage display for the user (e.g., 15).
     */
    private int impactPercentage;

    /**
     * Readable level: LOW, MEDIUM, HIGH, CRITICAL.
     */
    private String impactLevel;

    /**
     * Explicit explanation of the cause based on active rules.
     * Example: "Modest rain increases friction coefficient, reducing speed."
     */
    private String explanation;
}
