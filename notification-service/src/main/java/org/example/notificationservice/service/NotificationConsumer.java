package org.example.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    @Autowired
    private org.example.notificationservice.controller.NotificationController notificationController;

    @KafkaListener(topics = "trip-predictions", groupId = "notification-group")
    public void consumePrediction(String message) {
        System.out.println("Received prediction: " + message);
        if (notificationController != null) {
            notificationController.sendNotification(message);
        }
    }

    @KafkaListener(topics = "traffic-updates", groupId = "notification-group")
    public void consumeTraffic(String message) {
        System.out.println("Received traffic update: " + message);
    }
}
