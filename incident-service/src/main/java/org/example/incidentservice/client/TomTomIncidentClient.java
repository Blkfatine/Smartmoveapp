package org.example.incidentservice.client;

import org.example.incidentservice.client.dto.Geometry;
import org.example.incidentservice.client.dto.Properties;
import org.example.incidentservice.client.dto.TomTomIncident;
import org.example.incidentservice.client.dto.TomTomResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 100% Free Incident Provider for Morocco / Casablanca
 * Generates and provides realistic traffic incidents without any external paid API or credit consumption.
 */
@Component
public class TomTomIncidentClient {

    public TomTomResponse getIncidents() {
        TomTomResponse response = new TomTomResponse();
        List<TomTomIncident> incidents = new ArrayList<>();

        // Incident 1: Casablanca - Bd Zerktouni (Travaux)
        TomTomIncident inc1 = new TomTomIncident();
        Properties p1 = new Properties();
        p1.set("description", "Travaux de voirie - Voie rétrécie sur Bd Zerktouni");
        inc1.setProperties(p1);
        Geometry g1 = new Geometry();
        g1.setCoordinates(List.of(List.of(-7.6280, 33.5870))); // Casablanca Maarif / Zerktouni
        inc1.setGeometry(g1);
        incidents.add(inc1);

        // Incident 2: Casablanca - Autoroute Urbaine A3 (Ralentissement important)
        TomTomIncident inc2 = new TomTomIncident();
        Properties p2 = new Properties();
        p2.set("description", "Accident léger - Ralentissement sur Autoroute Urbaine direction Rabat");
        inc2.setProperties(p2);
        Geometry g2 = new Geometry();
        g2.setCoordinates(List.of(List.of(-7.5450, 33.5840)));
        inc2.setGeometry(g2);
        incidents.add(inc2);

        // Incident 3: Casablanca - Corniche Ain Diab (Forte affluence)
        TomTomIncident inc3 = new TomTomIncident();
        Properties p3 = new Properties();
        p3.set("description", "Forte densité de circulation près du Bd de la Corniche");
        inc3.setProperties(p3);
        Geometry g3 = new Geometry();
        g3.setCoordinates(List.of(List.of(-7.6700, 33.5900)));
        inc3.setGeometry(g3);
        incidents.add(inc3);

        // Incident 4: Rabat - Avenue Hassan II
        TomTomIncident inc4 = new TomTomIncident();
        Properties p4 = new Properties();
        p4.set("description", "Travaux d'aménagement urbain - Voie de droite fermée");
        inc4.setProperties(p4);
        Geometry g4 = new Geometry();
        g4.setCoordinates(List.of(List.of(-6.8416, 34.0209)));
        inc4.setGeometry(g4);
        incidents.add(inc4);

        response.setIncidents(incidents);
        return response;
    }
}
