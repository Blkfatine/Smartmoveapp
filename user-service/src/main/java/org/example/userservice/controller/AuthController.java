package org.example.userservice.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Mock authentication
        if ("admin".equals(request.getUsername()) && "admin".equals(request.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("token", "mock-jwt-token-123456");
            response.put("username", "admin");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("User Service is UP");
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class LoginRequest {
        private String username;
        private String password;
    }
}
