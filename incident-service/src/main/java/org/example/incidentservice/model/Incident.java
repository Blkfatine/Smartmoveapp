package org.example.incidentservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.example.incidentservice.enums.Severity;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String type;
    private String description;
    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    private LocalDateTime timestamp;
}