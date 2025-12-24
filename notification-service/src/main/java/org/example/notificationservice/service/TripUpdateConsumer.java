package org.example.notificationservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.notificationservice.model.TripUpdateEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.io.IOException;


@Service
public class TripUpdateConsumer {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TripUpdateConsumer.class);


    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final org.example.notificationservice.repository.NotificationRepository notificationRepository;
    private final org.example.notificationservice.controller.NotificationController notificationController;

    public TripUpdateConsumer(com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                              org.example.notificationservice.repository.NotificationRepository notificationRepository,
                              org.example.notificationservice.controller.NotificationController notificationController) {
        this.objectMapper = objectMapper;
        this.notificationRepository = notificationRepository;
        this.notificationController = notificationController;
    }

    @KafkaListener(topics = "trip-updates", groupId = "notification-group")
    public void consumeTripUpdate(Object message) {
        try {
            org.example.notificationservice.model.TripUpdateEvent event = null;
            if (message instanceof String) {
                event = objectMapper.readValue((String) message, org.example.notificationservice.model.TripUpdateEvent.class);
            } else {
                event = objectMapper.convertValue(message, org.example.notificationservice.model.TripUpdateEvent.class);
            }

            if (event == null) return;

            org.example.notificationservice.model.Notification notification;

            // Optional: Check for duplicates
            java.util.Optional<org.example.notificationservice.model.Notification> existing = 
                notificationRepository.findByUserIdAndTypeAndMessage(event.getUserId(), "TRIP_UPDATE", event.getReason());
            
            if (existing.isPresent()) {
                notification = existing.get();
                notification.setTimestamp(java.time.LocalDateTime.now());
                notification.setRead(false); // Reset to unread if it's an update
            } else {
                notification = new org.example.notificationservice.model.Notification();
                notification.setUserId(event.getUserId());
                notification.setTitle("Mise à jour de trajet");
                notification.setMessage(event.getReason());
                notification.setTimestamp(java.time.LocalDateTime.now());
                notification.setRead(false);
                notification.setType("TRIP_UPDATE");
            }

            notificationRepository.save(notification);

            // Broadcast real-time
            if (notificationController != null) {
                notificationController.sendNotification(notification);
            }

            log.info("Notification persisted and broadcasted for user {}", event.getUserId());

        } catch (Exception e) {
            log.error("Error processing trip update: {}", e.getMessage());
        }
    }
}
