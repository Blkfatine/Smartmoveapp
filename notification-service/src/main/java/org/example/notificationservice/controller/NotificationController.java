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

    private final java.util.Map<String, java.util.List<SseEmitter>> userEmitters = new java.util.concurrent.ConcurrentHashMap<>();

    @GetMapping
    public java.util.List<org.example.notificationservice.model.Notification> getHistory(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String userId) {
        if (userId != null) {
            return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
        }
        return notificationRepository.findAll();
    }

    public void sendNotification(org.example.notificationservice.model.Notification notification) {
        String json;
        try {
            json = objectMapper.writeValueAsString(notification);
        } catch (Exception e) {
            json = "{\"title\":\"Error\", \"message\":\"Serialization failed\"}";
        }

        String userId = notification.getUserId();
        if (userId != null && userEmitters.containsKey(userId)) {
            java.util.List<SseEmitter> emitters = userEmitters.get(userId);
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().data(json));
                } catch (IOException e) {
                    emitters.remove(emitter);
                }
            }
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }

    @GetMapping("/stream")
    public SseEmitter streamNotifications(@org.springframework.web.bind.annotation.RequestParam String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connect").data("Connected to SmartMove Real-Time for user " + userId));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(String userId, SseEmitter emitter) {
        java.util.List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }
}
