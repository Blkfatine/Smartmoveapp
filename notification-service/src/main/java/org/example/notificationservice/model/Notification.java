package org.example.notificationservice.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

    @Entity
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public class Notification {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String title;
        private String message;

        private String userEmail;  // destinataire

        private LocalDateTime timestamp;

        private String type; // INCIDENT, TRAFFIC, WEATHER
    }
