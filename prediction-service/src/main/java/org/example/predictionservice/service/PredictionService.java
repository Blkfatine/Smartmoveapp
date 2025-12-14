package org.example.predictionservice.service;

import lombok.RequiredArgsConstructor;
import org.example.predictionservice.model.Prediction;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Random random = new Random();

    @Scheduled(fixedRate = 10000) // Every 10 seconds
    public void generateMockPrediction() {
        String[] locations = { "Maarif", "Technopark", "Ain Diab", "Sidi Maarouf", "Centre Ville", "Casa Port" };
        String origin = locations[random.nextInt(locations.length)];
        String destination = locations[random.nextInt(locations.length)];

        // Ensure origin != destination
        while (origin.equals(destination)) {
            destination = locations[random.nextInt(locations.length)];
        }

        double duration = 15 + random.nextDouble() * 45; // 15 to 60 mins
        String risk = duration > 45 ? "HIGH" : (duration > 25 ? "MEDIUM" : "LOW");

        Prediction prediction = new Prediction(
                origin,
                destination,
                duration,
                risk,
                LocalDateTime.now().toString());

        System.out.println("Generated Prediction: " + prediction);
        // Publish to Kafka
        kafkaTemplate.send("trip-predictions", UUID.randomUUID().toString(), prediction);
    }
}
