
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
  isLoading = false;

  onPlanTrip(event: { origin: string, destination: string, date: string, time: string }) {
    console.log('Planning trip:', event);

    // 1. Show Loader
    this.isLoading = true;
    this.currentPrediction = null; // Clear previous

    // 2. Simulate Analysis Delay (2 seconds)
    setTimeout(() => {
      this.isLoading = false;

      // 3. Set Result
      this.currentPrediction = {
        origin: event.origin,
        destination: event.destination,
        predictedDuration: 35 + Math.random() * 15, // 35-50 mins
        riskLevel: Math.random() > 0.6 ? 'HIGH' : (Math.random() > 0.3 ? 'MEDIUM' : 'LOW'),
        timestamp: new Date().toISOString()
      };

    }, 2000);
  }
}
