package org.example.incidentservice.service;
import lombok.RequiredArgsConstructor;
import org.example.incidentservice.client.TomTomIncidentClient;
import org.example.incidentservice.client.dto.TomTomIncident;
import org.example.incidentservice.client.dto.TomTomResponse;
import org.example.incidentservice.enums.Severity;
import org.example.incidentservice.model.Incident;
import org.example.incidentservice.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final TomTomIncidentClient tomTomIncidentClient;

    @Override
    public List<Incident> getAll() {
        return incidentRepository.findAll();
    }

    @Override
    public Incident getById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    @Override
    public Incident createIncident(Incident incident) {
        return incidentRepository.save(incident);
    }

    @Override
    public void delete(Long id) {
        incidentRepository.deleteById(id);
    }

    // 🚀 Import depuis TomTom
    @Override
    public List<Incident> importFromTomTom() {

        TomTomResponse tomtomResponse = tomTomIncidentClient.getIncidents();

        if (tomtomResponse == null || tomtomResponse.getIncidents() == null) {
            return List.of();
        }

        List<Incident> incidents = tomtomResponse.getIncidents().stream()
                .map(t -> {
                    Incident i = new Incident();
                    i.setType("TomTom");

                    // description
                    String desc = null;
                    if (t.getProperties() != null) {
                        desc = t.getProperties().getString("description");
                        if (desc == null) desc = t.getProperties().getString("text");
                    }
                    i.setDescription(desc != null ? desc : "Incident TomTom");

                    // ✅ CORRECTION : coordinates est maintenant List<List<Double>>
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

        return incidentRepository.saveAll(incidents);
    }
}