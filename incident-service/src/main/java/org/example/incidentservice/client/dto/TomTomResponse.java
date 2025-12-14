package org.example.incidentservice.client.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TomTomResponse {
    private List<TomTomIncident> incidents;
}
