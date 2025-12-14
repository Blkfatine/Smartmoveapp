package org.example.notificationservice.repository;


import org.example.notificationservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

    public interface NotificationRepository extends JpaRepository<Notification, Long> {
    }

