package org.example.predictionservice.controller;


import org.example.predictionservice.model.EnrichedPrediction;
import org.example.predictionservice.model.Prediction;
import org.example.predictionservice.model.PredictionRequest;
import org.example.predictionservice.service.PredictionService;
import org.example.predictionservice.service.TripMonitoringService;
import org.example.predictionservice.entity.MonitoredTrip;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;
    private final TripMonitoringService tripMonitoringService;

    public PredictionController(PredictionService predictionService, TripMonitoringService tripMonitoringService) {
        this.predictionService = predictionService;
        this.tripMonitoringService = tripMonitoringService;
    }

    @PostMapping("/predict")
    public EnrichedPrediction predictEnriched(@RequestBody PredictionRequest request) {
        return predictionService.predictEnriched(request);
    }

    @PostMapping("/monitor")
    public MonitoredTrip monitorTrip(@RequestBody PredictionRequest request) {
        // Using "userId" from request or generating a placeholder
        String userId = "user-" + System.currentTimeMillis();
        return tripMonitoringService.startMonitoring(request.getOrigin(), request.getDestination(), userId);
    }

    @GetMapping("/status")
    public String status() {
        return "Prediction Service is running with dynamic prediction capabilities.";
    }

    /**
     * Legacy endpoint for basic prediction (backward compatibility)
     */
    @PostMapping("/analyze")
    public ResponseEntity<Prediction> analyzeTrip(@RequestBody PredictionRequest request) {
        Prediction prediction = predictionService.analyzeTrip(
                request.getOrigin(),
                request.getDestination());
        return ResponseEntity.ok(prediction);
    }

    /**
     * New enriched prediction endpoint with full analysis
     */
    @PostMapping("/analyze/enriched")
    public ResponseEntity<EnrichedPrediction> analyzeEnrichedTrip(@RequestBody PredictionRequest request) {
        EnrichedPrediction prediction = predictionService.analyzeEnrichedTrip(
                request.getOrigin(),
                request.getDestination(),
                request.getDepartureDate(),
                request.getDepartureTime(),
                (request.getTransportMode() != null ? request.getTransportMode() : "driving"));
        return ResponseEntity.ok(prediction);
    }

    /**
     * GET endpoint for quick predictions (testing)
     */
    @GetMapping("/quick")
    public ResponseEntity<EnrichedPrediction> quickPrediction(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) String time,
            @RequestParam(required = false, defaultValue = "driving") String mode) {

        EnrichedPrediction prediction = predictionService.analyzeEnrichedTrip(
                origin, destination, null, time, mode);
        return ResponseEntity.ok(prediction);
    }
}
