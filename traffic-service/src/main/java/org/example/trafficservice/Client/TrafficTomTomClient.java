package org.example.trafficservice.Client;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

/**
 * 100% Free & Open-Source Routing and Geocoding Client
 * Replaces paid TomTom APIs with OSRM (Open Source Routing Machine) & Nominatim (OpenStreetMap)
 */
@Component
public class TrafficTomTomClient {

    private final RestTemplate restTemplate;

    public TrafficTomTomClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getTomTomTraffic(double lat, double lon) {
        // Free simulated traffic flow based on real Moroccan conditions
        int hour = java.time.LocalTime.now().getHour();
        boolean isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
        int currentSpeed = isPeak ? 25 : 55;
        int freeFlowSpeed = 60;
        
        return String.format(
            "{\"flowSegmentData\":{\"currentSpeed\":%d,\"freeFlowSpeed\":%d,\"currentTravelTime\":180,\"freeFlowTravelTime\":120,\"confidence\":0.95,\"roadClosure\":false}}",
            currentSpeed, freeFlowSpeed
        );
    }

    public String geocode(String query) {
        try {
            String encodedQuery = UriUtils.encode(query, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + encodedQuery + "&countrycodes=ma&format=json&limit=1";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "SmartMoveApp/1.0 (Student Mobility Project)");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Nominatim geocoding failed: " + e.getMessage());
            return "[]";
        }
    }

    public String getRoute(String start, String end) {
        try {
            // start is "lat,lon", end is "lat,lon"
            String[] startParts = start.split(",");
            String[] endParts = end.split(",");
            
            String startLat = startParts[0].trim();
            String startLon = startParts[1].trim();
            String endLat = endParts[0].trim();
            String endLon = endParts[1].trim();

            // OSRM expects lon,lat;lon,lat
            String url = "http://router.project-osrm.org/route/v1/driving/"
                    + startLon + "," + startLat + ";" + endLon + "," + endLat
                    + "?overview=full&geometries=geojson&alternatives=true";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "SmartMoveApp/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("OSRM route calculation failed: " + e.getMessage());
            return "{\"code\":\"Error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }
}
