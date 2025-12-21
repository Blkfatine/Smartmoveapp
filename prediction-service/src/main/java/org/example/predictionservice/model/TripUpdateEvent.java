package org.example.predictionservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripUpdateEvent {
    private Long tripId;
    private String userId;
    private double oldDuration;
    private double newDuration;
    private String reason;
    private String origin;
    private String destination;
}
