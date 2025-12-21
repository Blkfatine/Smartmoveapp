package org.example.notificationservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.notificationservice.model.TripUpdateEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TripUpdateConsumer {

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final org.example.notificationservice.repository.NotificationRepository notificationRepository;
    private final org.example.notificationservice.controller.NotificationController notificationController;

    @KafkaListener(topics = "trip-updates", groupId = "notification-group")
    public void consumeTripUpdate(Object message) {
        try {
            // ... (rest of the logic)
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
