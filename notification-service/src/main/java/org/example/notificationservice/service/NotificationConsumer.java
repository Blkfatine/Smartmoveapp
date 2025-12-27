package org.example.notificationservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.notificationservice.controller.NotificationController;
import org.example.notificationservice.model.Notification;
import org.example.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class NotificationConsumer {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationController notificationController;

    @KafkaListener(topics = "route.prediction.updated", groupId = "notification-group")
    public void consumeRouteUpdate(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, new TypeReference<>() {});
            
            String userId = (String) payload.get("userId");
            String origin = (String) payload.get("originLabel");
            String destination = (String) payload.get("destinationLabel");
            String routeId = (String) payload.get("historyRouteId");
            
            // "diff" contains what changed: delaySec, riskScore, advice
            Map<String, Object> diff = (Map<String, Object>) payload.get("diff");

            if (diff == null || diff.isEmpty()) {
                return; // No significant changes, ignore.
            }

            StringBuilder msgBuilder = new StringBuilder();
            String title = "Changement sur votre trajet";

            if (diff.containsKey("delaySec")) {
                Map<String, Object> delayData = (Map<String, Object>) diff.get("delaySec");
                long oldDelay = ((Number) delayData.get("from")).longValue();
                long newDelay = ((Number) delayData.get("to")).longValue();
                long addedDelay = (newDelay - oldDelay) / 60;
                
                if (addedDelay > 0) {
                    msgBuilder.append(String.format("Retard supplémentaire de %d min. ", addedDelay));
                    title = "Retard détecté";
                } else if (addedDelay < 0) {
                     msgBuilder.append(String.format("Bonne nouvelle ! Gain de %d min. ", Math.abs(addedDelay)));
                     title = "Trajet plus rapide";
                }
            }

            if (diff.containsKey("riskScore")) {
                Map<String, Object> riskData = (Map<String, Object>) diff.get("riskScore");
                double newRisk = ((Number) riskData.get("to")).doubleValue();
                if (newRisk > 50) {
                    msgBuilder.append("Risque élevé détecté (Météo/Trafic). ");
                }
            }

            if (diff.containsKey("advice")) {
                Map<String, Object> adviceData = (Map<String, Object>) diff.get("advice");
                String newAdvice = (String) adviceData.get("to");
                msgBuilder.append("Conseil: ").append(newAdvice);
            }

            String finalMessage = msgBuilder.toString();
            if (finalMessage.isEmpty()) {
                finalMessage = "Les conditions de votre trajet ont changé.";
            }

            saveAndBroadcast("ROUTE_UPDATE", title, finalMessage, userId, routeId);

        } catch (Exception e) {
            System.err.println("Error parsing route update: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Removed global listeners (weather, traffic, etc.) to prevent spam as requested.

    private void saveAndBroadcast(String type, String title, String message, String userId, String routeId) {
        Notification notification;
        
        if (userId == null) userId = "system";

        // De-duplicate: If a similar notification exists for this route recently, maybe update it?
        // For now, we append new ones but we could check timestamp.
        notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedRouteId(routeId);

        notificationRepository.save(notification);

        if (notificationController != null) {
            notificationController.sendNotification(notification);
        }
    }
}
