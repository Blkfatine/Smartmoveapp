package org.example.predictionservice.repository;

import org.example.predictionservice.model.RouteHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteHistoryRepository extends JpaRepository<RouteHistory, Long> {
    
    List<RouteHistory> findByUserIdOrderByLastUsedAtDesc(String userId);

    List<RouteHistory> findByTrackedTrue();

    Optional<RouteHistory> findByUserIdAndOriginPlaceIdAndDestinationPlaceIdAndMode(
            String userId, 
            String originPlaceId, 
            String destinationPlaceId, 
            String mode
    );
}
