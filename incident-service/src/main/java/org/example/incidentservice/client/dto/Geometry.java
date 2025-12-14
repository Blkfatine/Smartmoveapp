package org.example.incidentservice.client.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Geometry {
    private String type;

    // ✅ TomTom envoie un tableau de tableaux : [[lon, lat], [lon, lat], ...]
    private List<List<Double>> coordinates;

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