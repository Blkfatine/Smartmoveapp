package org.example.notificationservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.notificationservice.controller.NotificationController;
import org.example.notificationservice.model.Notification;
import org.example.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class IncidentConsumer {

    private static final Logger log = LoggerFactory.getLogger(IncidentConsumer.class);

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final NotificationController notificationController;

    public IncidentConsumer(ObjectMapper objectMapper,
                            NotificationRepository notificationRepository,
                            NotificationController notificationController) {
        this.objectMapper = objectMapper;
        this.notificationRepository = notificationRepository;
        this.notificationController = notificationController;
    }

    @KafkaListener(topics = "incident-updates", groupId = "notification-group")
    public void consumeIncidentUpdate(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);

            String description = node.has("description") ? node.get("description").asText() : "Incident routier signalé";
            double lat = node.has("latitude") ? node.get("latitude").asDouble() : 0.0;
            double lon = node.has("longitude") ? node.get("longitude").asDouble() : 0.0;
            String severity = node.has("severity") ? node.get("severity").asText() : "MEDIUM";

            Notification notification = new Notification();
            notification.setUserId("all");
            notification.setTitle("⚠️ Alerte Trafic (" + severity + ")");
            notification.setMessage(description + " [Position: " + lat + ", " + lon + "]");
            notification.setType("INCIDENT_ALERT");
            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);

            notificationRepository.save(notification);

            if (notificationController != null) {
                notificationController.sendNotification(notification);
            }

            log.info("Incident notification processed and broadcasted: {}", description);

        } catch (Exception e) {
            log.error("Error processing incident update from Kafka: {}", e.getMessage());
        }
    }
}
