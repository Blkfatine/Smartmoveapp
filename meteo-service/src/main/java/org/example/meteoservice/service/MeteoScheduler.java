package org.example.meteoservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class MeteoScheduler {

    @Autowired
    private MeteoProducer meteoProducer;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Casablanca coordinates
    private final double LAT = 33.5731;
    private final double LON = -7.5898;

    @Scheduled(fixedRate = 60000) // Every minute
    public void fetchAndSendWeather() {
        try {
            String url = String.format(
                    "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true", LAT, LON);
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode current = root.path("current_weather");

            double temperature = current.path("temperature").asDouble();
            double windspeed = current.path("windspeed").asDouble();
            int weathercode = current.path("weathercode").asInt();

            String condition = decodeWeatherCode(weathercode);

            Map<String, Object> weatherData = new HashMap<>();
            weatherData.put("temperature", temperature);
            weatherData.put("windspeed", windspeed);
            weatherData.put("condition", condition);
            weatherData.put("timestamp", LocalDateTime.now().toString());
            weatherData.put("location", "Casablanca");

            System.out.println("Sending weather update: " + weatherData);
            meteoProducer.sendWeatherUpdate(weatherData);

        } catch (Exception e) {
            System.err.println("Error fetching weather: " + e.getMessage());
        }
    }

    private String decodeWeatherCode(int code) {
        if (code == 0)
            return "SUNNY";
        if (code >= 1 && code <= 3)
            return "CLOUDY";
        if (code >= 45 && code <= 48)
            return "FOG";
        if (code >= 51 && code <= 67)
            return "RAIN";
        if (code >= 71 && code <= 77)
            return "SNOW";
        if (code >= 95)
            return "THUNDERSTORM";
        return "UNKNOWN";
    }
}
