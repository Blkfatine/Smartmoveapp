package org.example.incidentservice.service;

import jakarta.annotation.PostConstruct;
import org.example.incidentservice.client.TomTomIncidentClient;
import org.example.incidentservice.client.dto.TomTomResponse;
import org.example.incidentservice.enums.Severity;
import org.example.incidentservice.model.Incident;
import org.example.incidentservice.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final TomTomIncidentClient incidentClient;

    @Autowired(required = false)
    private IncidentProducer incidentProducer;

    public IncidentServiceImpl(IncidentRepository incidentRepository, TomTomIncidentClient incidentClient) {
        this.incidentRepository = incidentRepository;
        this.incidentClient = incidentClient;
    }

    @PostConstruct
    public void initDefaultIncidents() {
        if (incidentRepository.count() == 0) {
            importFromTomTom();
        }
    }

    @Override
    public List<Incident> getAll() {
        return incidentRepository.findAll();
    }

    @Override
    public Incident getById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + id));
    }

    @Override
    public Incident createIncident(Incident incident) {
        if (incident.getTimestamp() == null) {
            incident.setTimestamp(LocalDateTime.now());
        }
        Incident saved = incidentRepository.save(incident);

        // Publish to Kafka topic 'incident-updates'
        if (incidentProducer != null) {
            try {
                incidentProducer.sendIncidentUpdate(saved);
            } catch (Exception e) {
                System.err.println("Warning: Could not publish incident to Kafka: " + e.getMessage());
            }
        }

        return saved;
    }

    @Override
    public void delete(Long id) {
        incidentRepository.deleteById(id);
    }

    @Override
    public List<Incident> importFromTomTom() {
        TomTomResponse response = incidentClient.getIncidents();

        if (response == null || response.getIncidents() == null) {
            return List.of();
        }

        List<Incident> incidents = response.getIncidents().stream()
                .map(t -> {
                    Incident i = new Incident();
                    i.setType("ROAD_INCIDENT");

                    String desc = null;
                    if (t.getProperties() != null) {
                        desc = t.getProperties().getString("description");
                        if (desc == null) desc = t.getProperties().getString("text");
                    }
                    i.setDescription(desc != null ? desc : "Incident de circulation signalé");

                    if (t.getGeometry() != null && t.getGeometry().getCoordinates() != null
                            && !t.getGeometry().getCoordinates().isEmpty()) {

                        List<Double> firstPoint = t.getGeometry().getCoordinates().get(0);
                        if (firstPoint != null && firstPoint.size() >= 2) {
                            i.setLongitude(firstPoint.get(0));  // longitude
                            i.setLatitude(firstPoint.get(1));   // latitude
                        }
                    }

                    i.setSeverity(Severity.MEDIUM);
                    i.setTimestamp(LocalDateTime.now());

                    return i;
                })
                .toList();

        List<Incident> savedList = incidentRepository.saveAll(incidents);

        // Broadcast imported incidents to Kafka
        if (incidentProducer != null) {
            for (Incident inc : savedList) {
                try {
                    incidentProducer.sendIncidentUpdate(inc);
                } catch (Exception ignored) {}
            }
        }

        return savedList;
    }
}
