package org.example.incidentservice.client.dto;





import org.example.incidentservice.client.dto.Properties;


public class TomTomIncident {
    private String id;
    private Geometry geometry;
    private Properties properties;

    public TomTomIncident() {}

    public TomTomIncident(String id, Geometry geometry, Properties properties) {
        this.id = id;
        this.geometry = geometry;
        this.properties = properties;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Geometry getGeometry() {
        return geometry;
    }

    public void setGeometry(Geometry geometry) {
        this.geometry = geometry;
    }

    public Properties getProperties() {
        return properties;
    }

    public void setProperties(Properties properties) {
        this.properties = properties;
    }
}
