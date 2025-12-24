package org.example.incidentservice.client.dto;





import java.util.List;

public class TomTomResponse {
    private List<TomTomIncident> incidents;

    public TomTomResponse() {}

    public TomTomResponse(List<TomTomIncident> incidents) {
        this.incidents = incidents;
    }

    public List<TomTomIncident> getIncidents() {
        return incidents;
    }

    public void setIncidents(List<TomTomIncident> incidents) {
        this.incidents = incidents;
    }
}
