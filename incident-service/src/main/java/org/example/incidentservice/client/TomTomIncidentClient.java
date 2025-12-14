package org.example.incidentservice.client;

import lombok.RequiredArgsConstructor;
import org.example.incidentservice.client.dto.TomTomResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class TomTomIncidentClient {

    private final RestTemplate restTemplate;

    @Value("${tomtom.api-key}")
    private String apiKey;

    @Value("${tomtom.base-url}")
    private String baseUrl;

    public TomTomResponse getIncidents() {

        String bbox = "4.80,45.70,4.90,45.80";

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("key", apiKey)
                .queryParam("bbox", bbox)
                .queryParam("expand", "details")   // OPTIONNEL mais valide
                .toUriString();

        return restTemplate.getForObject(url, TomTomResponse.class);
    }



}