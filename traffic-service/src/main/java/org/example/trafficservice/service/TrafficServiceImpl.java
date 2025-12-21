package org.example.trafficservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.trafficservice.Client.TrafficTomTomClient;
import org.example.trafficservice.model.Traffic;
import org.example.trafficservice.repository.TrafficRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TrafficServiceImpl implements TrafficService {

    private final TrafficRepository trafficRepository;
    private final TrafficTomTomClient tomTomClient;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public List<Traffic> getAllTraffic() {
        return trafficRepository.findAll();
    }

    @Override
    public Traffic saveTraffic(Traffic traffic) {
        return trafficRepository.save(traffic);
    }

    @Override
    public Traffic getTrafficFromTomTom(double latitude, double longitude) {
        String json = tomTomClient.getTomTomTraffic(latitude, longitude);
        Traffic t = new Traffic();
        t.setSource("TomTom API");
        t.setRawResponse(json);

        try {
            kafkaTemplate.send("traffic-updates", "traffic-" + System.currentTimeMillis(), t);
        } catch (Exception e) {
            System.err.println("Failed to publish traffic update: " + e.getMessage());
        }

        return t;
    }

    @Override
    public Map<String, Object> calculateRoute(String origin, String destination) {
        String startCoords = getCoordinates(origin);
        String endCoords = getCoordinates(destination);

        if (startCoords == null || endCoords == null) {
            throw new RuntimeException("Impossible de trouver les coordonnées pour l'une des adresses.");
        }

        String jsonRoute = tomTomClient.getRoute(startCoords, endCoords);
        return parseRouteResponse(jsonRoute);
    }

    private String getCoordinates(String address) {
        try {
            String json = tomTomClient.geocode(address);
            JsonNode root = objectMapper.readTree(json);
            JsonNode position = root.path("results").get(0).path("position");
            return position.path("lat").asText() + "," + position.path("lon").asText();
        } catch (Exception e) {
            System.err.println("Geocoding failed for " + address + ": " + e.getMessage());
            return null;
        }
    }

    private Map<String, Object> parseRouteResponse(String json) {
        Map<String, Object> result = new HashMap<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode routesNode = root.path("routes");

            if (routesNode.isArray() && size(routesNode) > 0) {
                // Main Route (Best/First)
                JsonNode mainRoute = routesNode.get(0);
                mapRouteDetails(mainRoute, result); // Map main route to top-level for backward compatibility

                // Alternatives
                if (size(routesNode) > 1) {
                    java.util.List<Map<String, Object>> alternatives = new java.util.ArrayList<>();
                    for (int i = 1; i < size(routesNode); i++) {
                        Map<String, Object> altMap = new HashMap<>();
                        mapRouteDetails(routesNode.get(i), altMap);
                        alternatives.add(altMap);
                    }
                    result.put("alternatives", alternatives);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            result.put("error", "Parsing failed");
        }
        return result;
    }

    private int size(JsonNode node) {
        return node == null ? 0 : node.size();
    }

    private void mapRouteDetails(JsonNode route, Map<String, Object> map) {
        JsonNode summary = route.path("summary");

        int travelTime = summary.path("travelTimeInSeconds").asInt();
        int length = summary.path("lengthInMeters").asInt();
        int delay = summary.path("trafficDelayInSeconds").asInt();

        map.put("durationMinutes", travelTime / 60.0);
        map.put("distanceKm", length / 1000.0);
        map.put("trafficDelayMinutes", delay / 60.0);

        // Geometry
        JsonNode legs = route.path("legs");
        if (legs.isArray() && legs.size() > 0) {
            JsonNode points = legs.get(0).path("points");
            map.put("routeGeometry", objectMapper.convertValue(points, List.class));
        }

        // Risk
        double ratio = (double) delay / travelTime;
        String risk = "LOW";
        if (delay > 300 && ratio > 0.2)
            risk = "HIGH"; // > 5 min delay AND > 20%
        else if (delay > 180 && ratio > 0.1)
            risk = "MEDIUM"; // > 3 min delay AND > 10%

        map.put("riskLevel", risk);
    }
}
