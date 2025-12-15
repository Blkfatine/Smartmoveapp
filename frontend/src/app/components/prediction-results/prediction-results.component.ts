
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prediction } from '../../services/prediction.service';

@Component({
  selector: 'app-prediction-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-3 mb-3 shadow-sm" *ngIf="prediction">
      <h5 class="card-title text-primary"><i class="bi bi-graph-up-arrow"></i> Analyse du Trajet</h5>
      
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small class="text-muted">Durée Estimée</small>
          <h2 class="mb-0">{{prediction.predictedDuration | number:'1.0-0'}} min</h2>
        </div>
        <div class="text-center">
            <span class="badge rounded-pill" 
                [ngClass]="{
                    'bg-success': prediction.riskLevel === 'LOW',
                    'bg-warning': prediction.riskLevel === 'MEDIUM',
                    'bg-danger': prediction.riskLevel === 'HIGH'
                }">
                {{prediction.riskLevel === 'HIGH' ? 'Risque Élevé' : (prediction.riskLevel === 'MEDIUM' ? 'Risque Moyen' : 'Risque Faible')}}
            </span>
        </div>
      </div>

      <div class="mb-3">
        <small class="text-uppercase text-muted fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Facteurs d'impact</small>
        <div class="progress mt-2" style="height: 24px; border-radius: 12px; font-size: 0.75rem; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
            <!-- Mocked factors visuals -->
          <div class="progress-bar bg-gradient-info" role="progressbar" style="width: 40%">Trafic</div>
          <div class="progress-bar bg-gradient-warning" role="progressbar" style="width: 20%">Météo</div>
          <div class="progress-bar bg-gradient-secondary" role="progressbar" style="width: 10%">Heure</div>
        </div>
      </div>
      
      <div class="alert alert-light border-0 bg-blue-50 d-flex align-items-center gap-2" style="background-color: #EFF6FF; color: #1E40AF;">
         <i class="bi bi-info-circle-fill fs-5"></i>
         <small class="fw-medium">Le trajet {{prediction.origin}} -> {{prediction.destination}} est impacté par une densité de trafic modérée.</small>
      </div>

    </div>
  `,
  styles: [`
    .card { border: none; }
    .bg-gradient-info { background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%); }
    .bg-gradient-warning { background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%); }
    .bg-gradient-secondary { background: linear-gradient(90deg, #9CA3AF 0%, #6B7280 100%); }
  `]
})
export class PredictionResultsComponent {
  @Input() prediction: Prediction | null = null;
}

