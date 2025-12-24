package org.example.notificationservice.service;


import org.example.notificationservice.model.Notification;
import org.example.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public Notification sendNotification(Notification notification) {
        notification.setTimestamp(LocalDateTime.now());
        return notificationRepository.save(notification);
    }
}

