package org.example.incidentservice.controller;


import org.example.incidentservice.model.Incident;
import org.example.incidentservice.service.IncidentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<Incident> getAll() {
        return incidentService.getAll();
    }

    @GetMapping("/{id}")
    public Incident getById(@PathVariable Long id) {
        return incidentService.getById(id);
    }

    @PostMapping
    public Incident create(@RequestBody Incident incident) {
        return incidentService.createIncident(incident);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        incidentService.delete(id);
    }

    // ⭐⭐ AJOUT IMPORTANT ⭐⭐
    @GetMapping("/import-tomtom")
    public List<Incident> importFromTomTom() {
        return incidentService.importFromTomTom();
    }
}
