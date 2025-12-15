
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService, Prediction } from '../../services/prediction.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-4 shadow-sm h-100">
      <h5 class="card-title text-danger mb-4 d-flex align-items-center gap-2">
        <i class="bi bi-bell-fill"></i> <span class="fw-bold" style="font-size: 1rem; letter-spacing: 0.5px;">ALERTES TRAFIC</span>
      </h5>
      <div class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
        <div *ngIf="alerts.length === 0" class="text-center text-muted p-4 bg-light rounded-3">
            <i class="bi bi-check-circle fs-3 text-success mb-2 d-block"></i>
            <small>Aucune alerte signalée</small>
        </div>
        <div *ngFor="let alert of alerts" class="list-group-item border-0 border-bottom py-3 px-2 d-flex justify-content-between align-items-start animate__animated animate__fadeIn hover-bg">
          <div class="ms-2 me-auto">
            <div class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">{{alert.origin}} &rarr; {{alert.destination}}</div>
            <small class="text-muted"><i class="bi bi-clock"></i> +{{alert.predictedDuration | number:'1.0-0'}} min</small>
          </div>
          <span class="badge rounded-pill shadow-sm" 
                [ngClass]="{
                    'bg-danger': alert.riskLevel === 'HIGH', 
                    'bg-warning': alert.riskLevel === 'MEDIUM',
                    'bg-success': alert.riskLevel === 'LOW'
                }" style="font-size: 0.7rem; font-weight: 600;">
                {{alert.riskLevel}}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; }
    .list-group-item { transition: background-color 0.2s; }
    .list-group-item:hover { background-color: #F8FAFC; }
    .list-group-item:last-child { border-bottom: none !important; }
  `]
})
export class AlertsComponent implements OnInit {
  alerts: Prediction[] = [];
  private predictionService = inject(PredictionService);

  ngOnInit() {
    this.predictionService.getPredictions().subscribe(preds => {
      // Add new alerts to the top
      this.alerts = [...preds, ...this.alerts].slice(0, 10); // Keep last 10
    });
  }
}
