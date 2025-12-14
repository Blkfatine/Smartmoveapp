package org.example.meteoservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class MeteoProducer {

    private static final String TOPIC = "weather-updates";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendWeatherUpdate(Object weatherData) {
        kafkaTemplate.send(TOPIC, weatherData);
    }
}
