package org.example.predictionservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @GetMapping("/status")
    public String status() {
        return "Prediction Service is running and generating mock data...";
    }
}
