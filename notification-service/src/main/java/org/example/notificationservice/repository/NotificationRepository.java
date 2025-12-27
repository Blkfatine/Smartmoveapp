package org.example.notificationservice.repository;


import org.example.notificationservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    java.util.Optional<Notification> findByUserIdAndTypeAndMessage(String userId, String type, String message);
    java.util.List<Notification> findByUserIdAndIsReadFalse(String userId);
    java.util.List<Notification> findByUserIdOrderByTimestampDesc(String userId);
}

