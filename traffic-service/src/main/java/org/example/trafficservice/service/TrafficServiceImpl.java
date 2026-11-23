package org.example.trafficservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.trafficservice.Client.TrafficTomTomClient;
import org.example.trafficservice.model.Traffic;
import org.example.trafficservice.repository.TrafficRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TrafficServiceImpl implements TrafficService {

    private final TrafficRepository trafficRepository;
    private final TrafficTomTomClient routingClient;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    // Fallback coordinates for Moroccan locations (Casablanca, Rabat, etc.)
    private static final Map<String, String> MOROCCAN_COORDS = new HashMap<>();
    static {
        MOROCCAN_COORDS.put("riad el ali", "33.5635,-7.6170");
        MOROCCAN_COORDS.put("riad al ali", "33.5635,-7.6170");
        MOROCCAN_COORDS.put("residence riad el ali", "33.5635,-7.6170");
        MOROCCAN_COORDS.put("riad ali", "33.5635,-7.6170");
        MOROCCAN_COORDS.put("2 mars", "33.5660,-7.6140");
        MOROCCAN_COORDS.put("modibo keita", "33.5620,-7.6195");
        MOROCCAN_COORDS.put("l'hermitage", "33.5670,-7.6210");
        MOROCCAN_COORDS.put("hermitage", "33.5670,-7.6210");
        MOROCCAN_COORDS.put("bachkou", "33.5620,-7.6220");
        MOROCCAN_COORDS.put("polo", "33.5590,-7.6150");
        MOROCCAN_COORDS.put("californie", "33.5380,-7.6250");
        MOROCCAN_COORDS.put("morocco mall", "33.5750,-7.7080");
        MOROCCAN_COORDS.put("casa voyageurs", "33.5890,-7.5905");
        MOROCCAN_COORDS.put("casa oasis", "33.5560,-7.6320");
        MOROCCAN_COORDS.put("derb sultan", "33.5680,-7.5990");
        MOROCCAN_COORDS.put("beausejour", "33.5700,-7.6550");
        MOROCCAN_COORDS.put("val fleuri", "33.5780,-7.6360");
        MOROCCAN_COORDS.put("ain sebaa", "33.6080,-7.5350");
        MOROCCAN_COORDS.put("sidi bernoussi", "33.6150,-7.5050");
        MOROCCAN_COORDS.put("maarif", "33.5833,-7.6333");
        MOROCCAN_COORDS.put("casa port", "33.6033,-7.6164");
        MOROCCAN_COORDS.put("technopark", "33.5167,-7.6500");
        MOROCCAN_COORDS.put("ain diab", "33.5900,-7.6700");
        MOROCCAN_COORDS.put("anfa", "33.5783,-7.6481");
        MOROCCAN_COORDS.put("centre ville", "33.5950,-7.6200");
        MOROCCAN_COORDS.put("sidi maarouf", "33.5350,-7.6650");
        MOROCCAN_COORDS.put("bourgogne", "33.5800,-7.6250");
        MOROCCAN_COORDS.put("racine", "33.5850,-7.6350");
        MOROCCAN_COORDS.put("gauthier", "33.5870,-7.6280");
        MOROCCAN_COORDS.put("oasis", "33.5650,-7.6450");
        MOROCCAN_COORDS.put("hay hassani", "33.5550,-7.6800");
        MOROCCAN_COORDS.put("casablanca", "33.5731,-7.5898");
        MOROCCAN_COORDS.put("rabat", "34.0209,-6.8416");
        MOROCCAN_COORDS.put("marrakech", "31.6295,-7.9811");
        MOROCCAN_COORDS.put("tanger", "35.7595,-5.8340");
        MOROCCAN_COORDS.put("fes", "34.0181,-5.0078");
        MOROCCAN_COORDS.put("agadir", "30.4278,-9.5981");
        MOROCCAN_COORDS.put("el jadida", "33.2549,-8.5074");
        MOROCCAN_COORDS.put("mohammedia", "33.6861,-7.3833");
    }

    public TrafficServiceImpl(TrafficRepository trafficRepository, TrafficTomTomClient routingClient,
                              org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate,
                              ObjectMapper objectMapper) {
        this.trafficRepository = trafficRepository;
        this.routingClient = routingClient;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

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
        String json = routingClient.getTomTomTraffic(latitude, longitude);
        Traffic t = new Traffic();
        t.setSource("SmartMove Traffic Engine (Free)");
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
            throw new RuntimeException("Impossible de trouver les coordonnées pour l'une des adresses : " + origin + " -> " + destination);
        }

        String jsonRoute = routingClient.getRoute(startCoords, endCoords);
        return parseRouteResponse(jsonRoute, startCoords, endCoords);
    }

    private String getCoordinates(String address) {
        if (address == null || address.trim().isEmpty()) return null;
        address = address.trim();

        // 1. Direct coordinate check: "lat,lon"
        if (address.matches("^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$")) {
            return address.replaceAll("\\s+", "");
        }

        // 2. Fast & reliable Moroccan database lookup first
        String key = address.toLowerCase();
        for (Map.Entry<String, String> entry : MOROCCAN_COORDS.entrySet()) {
            if (key.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // 3. Nominatim Free Geocoding with Morocco restriction
        try {
            String query = (key.contains("maroc") || key.contains("morocco")) ? address : address + ", Casablanca, Maroc";
            String json = routingClient.geocode(query);
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray() && root.size() > 0) {
                JsonNode first = root.get(0);
                String lat = first.path("lat").asText();
                String lon = first.path("lon").asText();
                if (lat != null && lon != null && !lat.isEmpty() && !lon.isEmpty()) {
                    return lat + "," + lon;
                }
            }
        } catch (Exception e) {
            System.err.println("Nominatim lookup failed for " + address + ": " + e.getMessage());
        }

        // Default to Casablanca center if all else fails
        return "33.5731,-7.5898";
    }

    private Map<String, Object> parseRouteResponse(String json, String startCoords, String endCoords) {
        Map<String, Object> result = new HashMap<>();
        try {
            JsonNode root = objectMapper.readTree(json);

            // Handle OSRM format ("code": "Ok", "routes": [...])
            if (root.has("code") && "Ok".equalsIgnoreCase(root.path("code").asText()) && root.has("routes")) {
                JsonNode routesNode = root.path("routes");
                if (routesNode.isArray() && routesNode.size() > 0) {
                    JsonNode mainRoute = routesNode.get(0);
                    mapOsrmRouteDetails(mainRoute, result);

                    if (routesNode.size() > 1) {
                        List<Map<String, Object>> alternatives = new ArrayList<>();
                        for (int i = 1; i < routesNode.size(); i++) {
                            Map<String, Object> altMap = new HashMap<>();
                            mapOsrmRouteDetails(routesNode.get(i), altMap);
                            alternatives.add(altMap);
                        }
                        result.put("alternatives", alternatives);
                    }
                    return result;
                }
            }

            // Fallback synthetic route calculation if OSRM was unreachable
            return createFallbackRoute(startCoords, endCoords);

        } catch (Exception e) {
            System.err.println("Error parsing route: " + e.getMessage());
            return createFallbackRoute(startCoords, endCoords);
        }
    }

    private void mapOsrmRouteDetails(JsonNode route, Map<String, Object> map) {
        double distanceMeters = route.path("distance").asDouble(10000.0);
        double distanceKm = Math.round((distanceMeters / 1000.0) * 10.0) / 10.0;

        // Calibrated Moroccan Urban & Inter-city base duration
        double baseDurationMinutes;
        if (distanceKm <= 5.0) {
            // Hyper-center dense Casablanca: 18-20 km/h cruising speed (stoplights, intersections)
            baseDurationMinutes = Math.max(5.0, (distanceKm / 19.0) * 60.0);
        } else if (distanceKm <= 15.0) {
            // Urban periphery: ~22-25 km/h
            baseDurationMinutes = (distanceKm / 22.0) * 60.0;
        } else if (distanceKm <= 35.0) {
            // Urban highway / suburban: ~55 km/h
            baseDurationMinutes = 12.0 + ((distanceKm - 6.0) / 55.0) * 60.0;
        } else {
            // Inter-city highway (Casablanca - Rabat, etc.): ~105 km/h
            baseDurationMinutes = 15.0 + ((distanceKm - 10.0) / 105.0) * 60.0;
        }

        int hour = java.time.LocalTime.now().getHour();
        boolean isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
        double delayMinutes = isPeak
                ? Math.round((baseDurationMinutes * 0.70) * 10.0) / 10.0
                : Math.round((baseDurationMinutes * 0.20) * 10.0) / 10.0;

        double totalDurationMinutes = Math.round((baseDurationMinutes + delayMinutes) * 10.0) / 10.0;

        map.put("durationMinutes", totalDurationMinutes);
        map.put("distanceKm", distanceKm);
        map.put("trafficDelayMinutes", delayMinutes);

        // Convert OSRM GeoJSON coordinates [[lon, lat], ...] to frontend format [{latitude, longitude}]
        JsonNode coordinates = route.path("geometry").path("coordinates");
        List<Map<String, Double>> geometryPoints = new ArrayList<>();
        if (coordinates.isArray()) {
            for (JsonNode pt : coordinates) {
                if (pt.isArray() && pt.size() >= 2) {
                    Map<String, Double> point = new HashMap<>();
                    point.put("latitude", pt.get(1).asDouble());
                    point.put("longitude", pt.get(0).asDouble());
                    geometryPoints.add(point);
                }
            }
        }
        map.put("routeGeometry", geometryPoints);

        String risk = isPeak ? "MEDIUM" : "LOW";
        if (delayMinutes > 8) risk = "HIGH";
        map.put("riskLevel", risk);
    }

    private Map<String, Object> createFallbackRoute(String startCoords, String endCoords) {
        Map<String, Object> map = new HashMap<>();
        String[] s = startCoords.split(",");
        String[] e = endCoords.split(",");
        double lat1 = Double.parseDouble(s[0]);
        double lon1 = Double.parseDouble(s[1]);
        double lat2 = Double.parseDouble(e[0]);
        double lon2 = Double.parseDouble(e[1]);

        // Haversine formula
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = Math.round(6371 * c * 1.3 * 10.0) / 10.0; // 1.3 road curvature factor
        double durationMinutes = Math.round((distanceKm / 45.0 * 60.0) * 10.0) / 10.0; // 45 km/h urban average

        map.put("durationMinutes", Math.max(5.0, durationMinutes));
        map.put("distanceKm", Math.max(1.0, distanceKm));
        map.put("trafficDelayMinutes", 3.0);

        List<Map<String, Double>> pts = new ArrayList<>();
        Map<String, Double> p1 = new HashMap<>();
        p1.put("latitude", lat1);
        p1.put("longitude", lon1);
        Map<String, Double> p2 = new HashMap<>();
        p2.put("latitude", lat2);
        p2.put("longitude", lon2);
        pts.add(p1);
        pts.add(p2);
        map.put("routeGeometry", pts);
        map.put("riskLevel", "LOW");

        return map;
    }
}
