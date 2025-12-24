package org.example.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    @Autowired
    private org.example.notificationservice.repository.NotificationRepository notificationRepository;

    @Autowired
    private org.example.notificationservice.controller.NotificationController notificationController;

    @KafkaListener(topics = "trip-predictions", groupId = "notification-group")
    public void consumePrediction(String message) {
        System.out.println("Received prediction: " + message);
        saveAndBroadcast("PREDICTION", "Prédiction de trajet", message);
    }

    @KafkaListener(topics = "traffic-updates", groupId = "notification-group")
    public void consumeTraffic(String message) {
        System.out.println("Received traffic update: " + message);
        saveAndBroadcast("TRAFFIC", "Alerte Trafic", message);
    }

    private void saveAndBroadcast(String type, String title, String message) {
        org.example.notificationservice.model.Notification notification;
        
        // Use a generic userId if not provided in the Kafka message string (for demo)
        String userId = "system"; 

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
        }

        notificationRepository.save(notification);

        if (notificationController != null) {
            notificationController.sendNotification(notification);
        }
    }
}
