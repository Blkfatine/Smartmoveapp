package org.example.predictionservice.controller;

import org.example.predictionservice.model.RouteHistory;
import org.example.predictionservice.repository.RouteHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
@CrossOrigin("*") // Allow frontend access
public class HistoryController {

    private final RouteHistoryRepository historyRepository;

    public HistoryController(RouteHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @GetMapping
    public ResponseEntity<List<RouteHistory>> getUserHistory(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(historyRepository.findByUserIdOrderByLastUsedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<RouteHistory> addToHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody RouteHistory request) {
        
        String userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();

        // Check for existing route
        Optional<RouteHistory> existing = historyRepository.findByUserIdAndOriginPlaceIdAndDestinationPlaceIdAndMode(
                userId, request.getOriginPlaceId(), request.getDestinationPlaceId(), request.getMode());

        RouteHistory history;
        if (existing.isPresent()) {
            history = existing.get();
            history.setLastUsedAt(LocalDateTime.now());
            history.setTimesUsed(history.getTimesUsed() + 1);
            // Update labels/coords in case they improved/changed
            history.setOriginLabel(request.getOriginLabel());
            history.setDestinationLabel(request.getDestinationLabel());
        } else {
            history = request;
            history.setUserId(userId);
            history.setCreatedAt(LocalDateTime.now());
            history.setLastUsedAt(LocalDateTime.now());
            history.setTimesUsed(1);
            history.setTracked(false); // Default false, user must explicitly track
        }
        
        // Save (Upsert)
        return ResponseEntity.ok(historyRepository.save(history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFromHistory(@PathVariable Long id) {
        historyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/track")
    public ResponseEntity<RouteHistory> toggleTracking(@PathVariable Long id, @RequestParam boolean enabled) {
        return historyRepository.findById(id)
                .map(h -> {
                    h.setTracked(enabled);
                    return ResponseEntity.ok(historyRepository.save(h));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
             // Fallback for dev/testing without JWT
             // return "dev-user"; 
             return null;
        }
        try {
            String token = authHeader.substring(7);
            String[] chunks = token.split("\\.");
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            
            // Very simple JSON parsing to find "sub" or "userId"
            // Assuming standard claim "sub":"username"
            // Use regex to avoid importing heavy JSON lib if not needed, or use Jackson if available
            // Let's use simple string manipulation for robustness without deps
            
            if (payload.contains("\"sub\":\"")) {
                int start = payload.indexOf("\"sub\":\"") + 7;
                int end = payload.indexOf("\"", start);
                return payload.substring(start, end);
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
