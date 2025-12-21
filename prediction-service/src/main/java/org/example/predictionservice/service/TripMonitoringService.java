package org.example.predictionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.predictionservice.entity.MonitoredTrip;
import org.example.predictionservice.model.EnrichedPrediction;
import org.example.predictionservice.model.PredictionRequest;
import org.example.predictionservice.model.TripUpdateEvent;
import org.example.predictionservice.repository.MonitoredTripRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripMonitoringService {

    private final MonitoredTripRepository repository;
    private final PredictionService predictionService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Check every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void checkTrips() {
        log.info("Checking monitored trips for updates...");
        List<MonitoredTrip> activeTrips = repository.findByIsActiveTrue();

        for (MonitoredTrip trip : activeTrips) {
            try {
                // Re-calculate prediction
                // We use "now" as the departure time for the check
                String currentTime = LocalTime.now().toString().substring(0, 5); // HH:mm

                EnrichedPrediction prediction = predictionService.predictEnriched(
                        PredictionRequest.builder()
                                .origin(trip.getOrigin())
                                .destination(trip.getDestination())
                                .departureTime(currentTime)
                                .build());

                double newDuration = prediction.getPredictedDuration();
                double oldDuration = trip.getLastDuration();

                if (isSignificantChange(oldDuration, newDuration)) {
                    String reason = determineReason(prediction);

                    publishUpdate(trip, oldDuration, newDuration, reason);

                    // Update DB
                    trip.setLastDuration(newDuration);
                    repository.save(trip);
                }

            } catch (Exception e) {
                log.error("Failed to monitor trip ID: {}", trip.getId(), e);
            }
        }
    }

    private boolean isSignificantChange(double oldDur, double newDur) {
        // Threshold: > 5 minutes difference
        return Math.abs(newDur - oldDur) > 5.0;
    }

    private String determineReason(EnrichedPrediction p) {
        // Simple logic to extract primary reason
        if (p.getAlternativeRoutes() != null && !p.getAlternativeRoutes().isEmpty()) {
            return "Alternative plus rapide disponible via " + p.getRecommendedRoute().getDescription();
        }
        if (p.getTrafficCondition() != null && p.getTrafficCondition().equals("CONGESTION")) {
            return "Trafic dense détecté (+ " + String.format("%.0f", p.getPredictedDuration()) + " min)";
        }
        if (p.getWeatherCondition() != null
                && (p.getWeatherCondition().contains("Rain") || p.getWeatherCondition().contains("Pluie"))) {
            return "Météo défavorable (" + p.getWeatherCondition() + ")";
        }
        return "Changement des conditions de route";
    }

    private void publishUpdate(MonitoredTrip trip, double oldDur, double newDur, String reason) {
        TripUpdateEvent event = TripUpdateEvent.builder()
                .tripId(trip.getId())
                .userId(trip.getUserId())
                .oldDuration(oldDur)
                .newDuration(newDur)
                .reason(reason)
                .origin(trip.getOrigin())
                .destination(trip.getDestination())
                .build();

        log.info("Publishing trip update event: {}", event);
        kafkaTemplate.send("trip-updates", event);
    }

    public MonitoredTrip startMonitoring(String origin, String destination, String userId) {
        // Initial Calculation
        String currentTime = LocalTime.now().toString().substring(0, 5);
        EnrichedPrediction initial = predictionService.predictEnriched(
                PredictionRequest.builder()
                        .origin(origin)
                        .destination(destination)
                        .departureTime(currentTime)
                        .build());

        MonitoredTrip trip = MonitoredTrip.builder()
                .origin(origin)
                .destination(destination)
                .userId(userId)
                .originalDuration(initial.getPredictedDuration())
                .lastDuration(initial.getPredictedDuration())
                .isActive(true)
                .build();

        return repository.save(trip);
    }
}
