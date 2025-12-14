package org.example.incidentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidentProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendIncidentUpdate(Object incident) {
        System.out.println("Publishing incident update: " + incident);
        kafkaTemplate.send("incident-updates", UUID.randomUUID().toString(), incident);
    }
}
