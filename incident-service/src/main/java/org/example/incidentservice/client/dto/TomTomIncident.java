package org.example.incidentservice.client.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.example.incidentservice.client.dto.Properties;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class TomTomIncident {
    private String id;
    private Geometry geometry;
    private Properties properties;
}
