package org.example.notificationservice.service;

import org.example.notificationservice.model.Notification;

public interface NotificationService {
    Notification sendNotification(Notification notification);
}

