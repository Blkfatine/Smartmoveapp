package org.example.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private org.example.notificationservice.repository.NotificationRepository notificationRepository;

    @Autowired
    private org.example.notificationservice.controller.NotificationController notificationController;

    @KafkaListener(topics = "route.prediction.updated", groupId = "notification-group")
    public void consumeRouteUpdate(String message) {
        try {
            java.util.Map<String, Object> payload = objectMapper.readValue(message, new com.fasterxml.jackson.core.type.TypeReference<>(){});
            String userId = (String) payload.get("userId");
            String advice = (String) payload.get("advice");
            String routeId = (String) payload.get("historyRouteId");
            
            String title = "Trajet mis à jour";
            String msg = "Nouvelle recommandation " + advice + ". Vérifiez votre itinéraire.";
            
            saveAndBroadcast("ROUTE_UPDATE", title, msg, userId, routeId);
        } catch (Exception e) {
            System.err.println("Error parsing route update: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "trip-predictions", groupId = "notification-group")
    public void consumePrediction(String message) {
        saveAndBroadcast("PREDICTION", "Prédiction de trajet", message, "system", null);
    }

    @KafkaListener(topics = "traffic-updates", groupId = "notification-group")
    public void consumeTraffic(String message) {
        saveAndBroadcast("TRAFFIC", "Alerte Trafic", message, "system", null);
    }

    @KafkaListener(topics = "weather-updates", groupId = "notification-group")
    public void consumeWeather(String message) {
        saveAndBroadcast("WEATHER", "Alerte Météo", message, "system", null);
    }

    @KafkaListener(topics = "incident-updates", groupId = "notification-group")
    public void consumeIncident(String message) {
        saveAndBroadcast("INCIDENT", "Alerte Incident", message, "system", null);
    }

    private void saveAndBroadcast(String type, String title, String message, String userId, String routeId) {
        org.example.notificationservice.model.Notification notification;
        
        if (userId == null) userId = "system";

        java.util.Optional<org.example.notificationservice.model.Notification> existing = 
            notificationRepository.findByUserIdAndTypeAndMessage(userId, type, message);

        if (existing.isPresent()) {
            notification = existing.get();
            notification.setTimestamp(java.time.LocalDateTime.now());
            notification.setRead(false);
        } else {
            notification = new org.example.notificationservice.model.Notification();
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setTimestamp(java.time.LocalDateTime.now());
            notification.setRead(false);
            notification.setRelatedRouteId(routeId);
        }

        notificationRepository.save(notification);

        if (notificationController != null) {
            notificationController.sendNotification(notification);
        }
    }
}
