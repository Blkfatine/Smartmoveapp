
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

      <div class="mb-2">
        <small class="text-muted">Facteurs d'impact</small>
        <div class="progress mt-1" style="height: 20px;">
            <!-- Mocked factors visuals -->
          <div class="progress-bar bg-info" role="progressbar" style="width: 40%">Trafic</div>
          <div class="progress-bar bg-warning" role="progressbar" style="width: 20%">Météo</div>
          <div class="progress-bar bg-secondary" role="progressbar" style="width: 10%">Heure</div>
        </div>
      </div>
      
      <div class="alert alert-light border mt-2">
         <small><i class="bi bi-info-circle"></i> Le trajet {{prediction.origin}} -> {{prediction.destination}} est impacté par une densité de trafic modérée.</small>
      </div>

    </div>
  `,
    styles: [`
    .card { border-radius: 10px; border: none; }
  `]
})
export class PredictionResultsComponent {
    @Input() prediction: Prediction | null = null;
}
