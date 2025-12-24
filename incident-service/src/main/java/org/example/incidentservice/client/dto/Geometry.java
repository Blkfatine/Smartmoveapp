package org.example.incidentservice.client.dto;



import java.util.List;

public class Geometry {
    private String type;

    // ✅ TomTom envoie un tableau de tableaux : [[lon, lat], [lon, lat], ...]
    private List<List<Double>> coordinates;

    public Geometry() {}

    public Geometry(String type, List<List<Double>> coordinates) {
        this.type = type;
        this.coordinates = coordinates;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<List<Double>> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<List<Double>> coordinates) {
        this.coordinates = coordinates;
    }

    // 🎯 Méthodes helper pour récupérer le premier point facilement
    public Double getFirstLongitude() {
        if (coordinates != null && !coordinates.isEmpty() && !coordinates.get(0).isEmpty()) {
            return coordinates.get(0).get(0);
        }
        return null;
    }

    public Double getFirstLatitude() {
        if (coordinates != null && !coordinates.isEmpty() && !coordinates.get(0).isEmpty()) {
            return coordinates.get(0).get(1);
        }
        return null;
    }
}