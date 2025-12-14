
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService, Prediction } from '../../services/prediction.service';

@Component({
    selector: 'app-alerts',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="card p-3 shadow-sm">
      <h5 class="card-title text-danger"><i class="bi bi-bell-fill"></i> Alertes Temps Réel</h5>
      <div class="list-group list-group-flush" style="max-height: 300px; overflow-y: auto;">
        <div *ngIf="alerts.length === 0" class="text-center text-muted p-3">
            Aucune alerte récente
        </div>
        <div *ngFor="let alert of alerts" class="list-group-item list-group-item-action d-flex justify-content-between align-items-start animate__animated animate__fadeIn">
          <div class="ms-2 me-auto">
            <div class="fw-bold">{{alert.origin}} &rarr; {{alert.destination}}</div>
            Retard estimé: {{alert.predictedDuration | number:'1.0-0'}} min
          </div>
          <span class="badge rounded-pill" 
                [ngClass]="{
                    'bg-danger': alert.riskLevel === 'HIGH', 
                    'bg-warning': alert.riskLevel === 'MEDIUM',
                    'bg-success': alert.riskLevel === 'LOW'
                }">
                {{alert.riskLevel}}
          </span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .card { border-radius: 10px; border: none; }
    .list-group-item { border: none; border-bottom: 1px solid #f0f0f0; }
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
