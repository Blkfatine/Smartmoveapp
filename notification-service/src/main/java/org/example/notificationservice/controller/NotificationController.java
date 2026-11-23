package org.example.notificationservice.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private org.example.notificationservice.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private final Map<String, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    @GetMapping
    public List<org.example.notificationservice.model.Notification> getHistory(
            @RequestParam(required = false) String userId) {
        if (userId != null && !userId.isEmpty() && !userId.equalsIgnoreCase("all")) {
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

        String targetUserId = notification.getUserId();
        
        // Broadcast to specific user, to 'all', and to everyone if broadcast
        for (Map.Entry<String, List<SseEmitter>> entry : userEmitters.entrySet()) {
            String subUser = entry.getKey();
            if (targetUserId == null || targetUserId.equalsIgnoreCase("all") ||
                subUser.equalsIgnoreCase("all") || subUser.equalsIgnoreCase(targetUserId)) {
                
                List<SseEmitter> emitters = entry.getValue();
                for (SseEmitter emitter : emitters) {
                    try {
                        emitter.send(SseEmitter.event().name("notification").data(json));
                    } catch (IOException e) {
                        emitters.remove(emitter);
                    }
                }
            }
        }
    }

    @GetMapping("/stream")
    public SseEmitter streamNotifications(@RequestParam(required = false, defaultValue = "all") String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connect").data("{\"status\":\"CONNECTED\",\"userId\":\"" + userId + "\"}"));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(String userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }
}
