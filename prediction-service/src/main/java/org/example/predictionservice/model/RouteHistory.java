package org.example.predictionservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "route_history", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "origin_place_id", "destination_place_id", "mode"})
       })
public class RouteHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "origin_place_id", nullable = false)
    private String originPlaceId;
    
    private String originLabel;
    private Double originLat;
    private Double originLng;

    @Column(name = "destination_place_id", nullable = false)
    private String destinationPlaceId;
    
    private String destinationLabel;
    private Double destinationLat;
    private Double destinationLng;

    @Column(nullable = false)
    private String mode; // DRIVING, WALKING, TRANSIT, BICYCLING

    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
    
    private int timesUsed = 1;

    private boolean tracked = false;

    // Snapshot fields for monitoring
    private Long lastDelaySec;
    private Double lastRiskScore;
    private String lastAdviceType; // GO_EARLIER, GO_LATER, ON_TIME

    @Column(columnDefinition = "TEXT")
    private String lastSnapshotJson; // Full JSON for reference

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUsedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUsedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOriginPlaceId() { return originPlaceId; }
    public void setOriginPlaceId(String originPlaceId) { this.originPlaceId = originPlaceId; }

    public String getOriginLabel() { return originLabel; }
    public void setOriginLabel(String originLabel) { this.originLabel = originLabel; }

    public Double getOriginLat() { return originLat; }
    public void setOriginLat(Double originLat) { this.originLat = originLat; }

    public Double getOriginLng() { return originLng; }
    public void setOriginLng(Double originLng) { this.originLng = originLng; }

    public String getDestinationPlaceId() { return destinationPlaceId; }
    public void setDestinationPlaceId(String destinationPlaceId) { this.destinationPlaceId = destinationPlaceId; }

    public String getDestinationLabel() { return destinationLabel; }
    public void setDestinationLabel(String destinationLabel) { this.destinationLabel = destinationLabel; }

    public Double getDestinationLat() { return destinationLat; }
    public void setDestinationLat(Double destinationLat) { this.destinationLat = destinationLat; }

    public Double getDestinationLng() { return destinationLng; }
    public void setDestinationLng(Double destinationLng) { this.destinationLng = destinationLng; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(LocalDateTime lastUsedAt) { this.lastUsedAt = lastUsedAt; }

    public int getTimesUsed() { return timesUsed; }
    public void setTimesUsed(int timesUsed) { this.timesUsed = timesUsed; }

    public boolean isTracked() { return tracked; }
    public void setTracked(boolean tracked) { this.tracked = tracked; }

    public Long getLastDelaySec() { return lastDelaySec; }
    public void setLastDelaySec(Long lastDelaySec) { this.lastDelaySec = lastDelaySec; }

    public Double getLastRiskScore() { return lastRiskScore; }
    public void setLastRiskScore(Double lastRiskScore) { this.lastRiskScore = lastRiskScore; }

    public String getLastAdviceType() { return lastAdviceType; }
    public void setLastAdviceType(String lastAdviceType) { this.lastAdviceType = lastAdviceType; }

    public String getLastSnapshotJson() { return lastSnapshotJson; }
    public void setLastSnapshotJson(String lastSnapshotJson) { this.lastSnapshotJson = lastSnapshotJson; }
}
