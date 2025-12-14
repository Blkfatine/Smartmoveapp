
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map.component';
import { TripPlannerComponent } from './components/trip-planner/trip-planner.component';
import { PredictionResultsComponent } from './components/prediction-results/prediction-results.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { Prediction } from './services/prediction.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MapComponent,
    TripPlannerComponent,
    PredictionResultsComponent,
    AlertsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'smartmove-dashboard';
  currentPrediction: Prediction | null = null;

  onPlanTrip(event: { origin: string, destination: string }) {
    console.log('Planning trip:', event);
    // Simulate a prediction response instantly for demo purposes
    // In real scenario, this would trigger an API call or wait for SSE
    this.currentPrediction = {
      origin: event.origin,
      destination: event.destination,
      predictedDuration: 35 + Math.random() * 10,
      riskLevel: Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
      timestamp: new Date().toISOString()
    };
  }
}
