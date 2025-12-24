package org.example.incidentservice.client.dto;



import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;


import java.util.HashMap;
import java.util.Map;

public class Properties {
    // TomTom properties est un objet libre — on stocke dans une map pratique
    private Map<String, Object> props = new HashMap<>();

    @JsonAnySetter
    public void set(String name, Object value) {
        props.put(name, value);
    }

    @JsonAnyGetter
    public Map<String, Object> any() {
        return props;
    }

    // helper
    public String getString(String key) {
        Object v = props.get(key);
        return v == null ? null : v.toString();
    }

    public Double getDouble(String key) {
        Object v = props.get(key);
        if (v == null) return null;
        try {
            return Double.valueOf(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public Map<String, Object> getProps() {
        return props;
    }

    public void setProps(Map<String, Object> props) {
        this.props = props;
    }
}
