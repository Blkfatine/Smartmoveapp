package org.example.notificationservice.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.example.notificationservice.service.NotificationConsumer;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private org.example.notificationservice.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping
    public java.util.List<org.example.notificationservice.model.Notification> getHistory() {
        return notificationRepository.findAll();
    }

    public void sendNotification(org.example.notificationservice.model.Notification notification) {
        String json;
        try {
            json = objectMapper.writeValueAsString(notification);
        } catch (Exception e) {
            json = "{\"title\":\"Error\", \"message\":\"Serialization failed\"}";
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().data(json));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    @GetMapping("/stream")
    public SseEmitter streamNotifications() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));

        // Send a test event to confirm connection
        try {
            emitter.send(SseEmitter.event().name("connect").data("Connected to SmartMove Real-Time"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }
}
