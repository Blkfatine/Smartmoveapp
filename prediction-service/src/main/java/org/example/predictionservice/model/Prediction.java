package org.example.predictionservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Prediction {
    private String origin;
    private String destination;
    private double predictedDuration; // minutes
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String timestamp; // String for easier JSON serialization
}
