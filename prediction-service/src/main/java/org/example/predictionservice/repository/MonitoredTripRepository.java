package org.example.predictionservice.repository;

import org.example.predictionservice.entity.MonitoredTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MonitoredTripRepository extends JpaRepository<MonitoredTrip, Long> {
    List<MonitoredTrip> findByIsActiveTrue();
}
