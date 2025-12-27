package org.example.predictionservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.predictionservice.model.EnrichedPrediction;
import org.example.predictionservice.model.RouteHistory;
import org.example.predictionservice.repository.RouteHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PredictionMonitorService {

    private static final Logger logger = LoggerFactory.getLogger(PredictionMonitorService.class);
    private static final String TOPIC = "route.prediction.updated";

    private final RouteHistoryRepository historyRepository;
    private final PredictionService predictionService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public PredictionMonitorService(RouteHistoryRepository historyRepository, 
                                    PredictionService predictionService, 
                                    KafkaTemplate<String, String> kafkaTemplate,
                                    ObjectMapper objectMapper) {
        this.historyRepository = historyRepository;
        this.predictionService = predictionService;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    // Run every 2 minutes (120000 ms)
    @Scheduled(fixedRate = 120000)
    public void monitorRoutes() {
        logger.info("Starting scheduled route monitoring...");
        List<RouteHistory> trackedRoutes = historyRepository.findByTrackedTrue();
        
        for (RouteHistory route : trackedRoutes) {
            try {
                processRoute(route);
            } catch (Exception e) {
                logger.error("Error monitoring route {}: {}", route.getId(), e.getMessage());
            }
        }
    }

    private void processRoute(RouteHistory route) throws JsonProcessingException {
        // Prepare current time parameters
        String nowTime = String.format("%02d:%02d", LocalDateTime.now().getHour(), LocalDateTime.now().getMinute());
        String nowDate = LocalDateTime.now().toLocalDate().toString();

        EnrichedPrediction currentPrediction = predictionService.analyzeEnrichedTrip(
                route.getOriginLabel(), 
                route.getDestinationLabel(),
                nowDate,
                nowTime,
                route.getMode()
        );

        // Extract key metrics
        // Duration is in minutes. 
        double predictedMinutes = currentPrediction.getPredictedDuration();
        double baseMinutes = currentPrediction.getBaseDuration();
        long currentDelay = (long) ((predictedMinutes - baseMinutes) * 60); // Seconds

        // Risk is 0-100 int
        double currentRisk = (double) currentPrediction.getRiskScore(); 
        
        String currentAdvice = currentPrediction.getAiRecommendation();
        if (currentAdvice == null) currentAdvice = "UNKNOWN";

        // Check if significant change
        boolean significant = false;
        Map<String, Object> distinctChanges = new HashMap<>();

        if (route.getLastDelaySec() != null) {
            long diff = Math.abs(currentDelay - route.getLastDelaySec());
            if (diff >= 120) { // 2 mins diff
                significant = true;
                distinctChanges.put("delaySec", Map.of("from", route.getLastDelaySec(), "to", currentDelay));
            }
        } else {
             significant = false; 
        }

        if (route.getLastRiskScore() != null) {
            double diff = Math.abs(currentRisk - route.getLastRiskScore());
            // User asked for >= 0.10 change. If score is 0-100, 0.10 (10%) corresponds to 10 points.
            if (diff >= 10.0) {
                significant = true;
                distinctChanges.put("riskScore", Map.of("from", route.getLastRiskScore(), "to", currentRisk));
            }
        }

        if (route.getLastAdviceType() != null && !route.getLastAdviceType().equals(currentAdvice)) {
            significant = true;
            distinctChanges.put("advice", Map.of("from", route.getLastAdviceType(), "to", currentAdvice));
        }

        // Update Snapshot
        route.setLastDelaySec(currentDelay);
        route.setLastRiskScore(currentRisk);
        route.setLastAdviceType(currentAdvice);
        String jsonSnapshot = objectMapper.writeValueAsString(currentPrediction);
        route.setLastSnapshotJson(jsonSnapshot);
        
        historyRepository.save(route); // Persist new baseline

        if (significant) {
            publishEvent(route, currentPrediction, distinctChanges);
        }
    }

    private void publishEvent(RouteHistory route, EnrichedPrediction prediction, Map<String, Object> diff) throws JsonProcessingException {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("userId", route.getUserId());
        event.put("historyRouteId", route.getId().toString());
        event.put("originLabel", route.getOriginLabel());
        event.put("destinationLabel", route.getDestinationLabel());
        event.put("mode", route.getMode());
        event.put("advice", prediction.getAiRecommendation());
        event.put("diff", diff);
        event.put("fullSnapshot", prediction);

        String payload = objectMapper.writeValueAsString(event);
        kafkaTemplate.send(TOPIC, route.getUserId(), payload); 
        logger.info("Published route update event for user {}", route.getUserId());
    }
}
