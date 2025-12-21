import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prediction } from '../../services/prediction.service';

@Component({
  selector: 'app-prediction-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results animate-fade-in" *ngIf="prediction">
      
      <!-- Main Duration Card -->
      <div class="main-card animate-slide-up" [class]="'risk-' + prediction.riskLevel.toLowerCase()">
        <div class="duration-section">
          <span class="duration-icon">⏱️</span>
          <div class="duration-info">
            <span class="duration-value">{{ prediction.durationText || formatDuration(prediction.predictedDuration) }}</span>
            <span class="duration-label">Durée estimée</span>
          </div>
        </div>
        
        <div class="time-row">
          <div class="time-item">
            <span>🚀 Départ</span>
            <strong>{{ prediction.departureTime || '--:--' }}</strong>
          </div>
          <span class="arrow">→</span>
          <div class="time-item">
            <span>🏁 Arrivée</span>
            <strong>{{ prediction.arrivalTime || '--:--' }}</strong>
          </div>
        </div>
        
        <div class="info-row">
          <span class="info-item">📍 {{ prediction.distanceKm | number:'1.1-1' }} km</span>
          <span class="info-item risk-badge">
            {{ getRiskEmoji() }} {{ getRiskLabel() }}
          </span>
        </div>
      </div>

      <!-- AI Recommendation (Conseil SmartMove) - MOVED UP FOR VISIBILITY -->
      <div class="ai-card animate-slide-up delay-1" *ngIf="prediction.aiRecommendation">
        <div class="ai-header">
           <span class="ai-icon">🤖</span>
           <strong>Conseil SmartMove</strong>
        </div>
        <p class="ai-text">{{ prediction.aiRecommendation }}</p>
      </div>

      <!-- Impact Factors -->
      <div class="section animate-slide-up delay-2">
        <h4 class="section-title">📊 Facteurs d'Impact</h4>
        <div class="impact-list" *ngIf="prediction.impactFactors">
          <div class="impact-item">
            <span class="impact-label">🚗 Trafic</span>
            <div class="impact-bar-bg">
              <div class="impact-bar traffic" [style.width.%]="prediction.impactFactors.traffic"></div>
            </div>
            <div class="impact-info-col">
              <span class="impact-status" [class]="getTrafficStatusClass(prediction.impactFactors.traffic)">
                {{ getTrafficStatusLabel(prediction.impactFactors.traffic) }}
              </span>
              <span class="weather-details">
                ≈ +{{ getTrafficDelay(prediction.impactFactors.traffic) }} min de retard
              </span>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-label">🌤️ Météo</span>
            <div class="impact-bar-bg">
              <div class="impact-bar weather" [style.width.%]="prediction.impactFactors.weather"></div>
            </div>
            <div class="impact-info-col">
              <span class="impact-status" [class]="getWeatherStatusClass(prediction.impactFactors.weather)">
                {{ getWeatherStatusLabel(prediction.impactFactors.weather) }}
              </span>
              <span class="weather-details" *ngIf="prediction.weatherCondition">
                🌤 {{ prediction.weatherCondition }} 🌡 {{ prediction.temperature | number:'1.0-0' }}°C 💨 {{ getWindLabel() }}
              </span>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-label">⚠️ Accidents</span>
            <div class="impact-bar-bg">
              <div class="impact-bar incidents" [style.width.%]="prediction.impactFactors.incidents"></div>
            </div>
            <div class="impact-info-col">
              <span class="impact-status" [class]="getIncidentStatusClass(prediction.impactFactors.incidents)">
                {{ getIncidentStatusLabel(prediction.impactFactors.incidents) }}
              </span>
              <span class="weather-details">
                {{ getIncidentDetails() }}
              </span>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-label">⏰ Heure</span>
            <div class="impact-bar-bg">
              <div class="impact-bar peakhour" [style.width.%]="prediction.impactFactors.peakHour"></div>
            </div>
            <div class="impact-info-col">
              <span class="impact-status" [class]="getPeakHourClass(prediction.impactFactors.peakHour)">
                {{ getPeakHourLabel(prediction.impactFactors.peakHour) }}
              </span>
              <span class="weather-details">
                {{ prediction.isPeakHour ? 'Risque élevé de ralentissements' : 'Conditions de circulation favorables' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Conditions -->
      <div class="section animate-slide-up delay-3">
        <h4 class="section-title">🔍 Conditions Actuelles</h4>
        <div class="conditions-grid">
          <div class="condition" [class.active]="prediction.isPeakHour">
            <span class="cond-icon">⏰</span> 
            <span class="cond-text">{{ prediction.isPeakHour ? 'Heure de pointe' : 'Heure creuse' }}</span>
          </div>
          <div class="condition" [class.warning]="prediction.hasIncidents">
            <span class="cond-icon">🚧</span> 
            <span class="cond-text">{{ prediction.hasIncidents ? prediction.incidentCount + ' incident(s)' : 'Aucun incident' }}</span>
          </div>
          <div class="condition">
            <span class="cond-icon">{{ getWeatherIcon() }}</span> 
            <span class="cond-text">{{ prediction.weatherCondition }} ({{ prediction.temperature | number:'1.0-0' }}°C)</span>
          </div>
          <div class="condition traffic-{{ prediction.trafficCondition?.toLowerCase() }}">
            <span class="cond-icon">🚦</span> 
            <span class="cond-text">Trafic {{ prediction.trafficCondition }}</span>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="section details-section animate-slide-up delay-4" *ngIf="prediction.explanationPoints?.length">
        <h4 class="section-title">📋 Détails du trajet</h4>
        <ul class="details-list">
          <li *ngFor="let point of prediction.explanationPoints" class="detail-item">
            <span class="detail-dot"></span>
            {{ point }}
          </li>
        </ul>
      </div>

    </div>
  `,
  styles: [`
    .results {
      padding-bottom: 24px;
    }

    /* Main Card */
    .main-card {
      padding: 24px;
      border-radius: 20px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      box-shadow: 0 10px 30px rgba(22, 163, 74, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 20px;
    }

    .main-card.risk-medium {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 10px 30px rgba(217, 119, 6, 0.3);
    }

    .main-card.risk-high {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
    }

    .duration-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .duration-icon { font-size: 40px; }

    .duration-info { display: flex; flex-direction: column; }
    .duration-value { font-size: 38px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
    .duration-label { font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 4px; }

    .time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .time-item { display: flex; flex-direction: column; gap: 2px; }
    .time-item span { font-size: 11px; font-weight: 600; opacity: 0.8; text-transform: uppercase; }
    .time-item strong { font-size: 20px; font-weight: 800; }
    .arrow { font-size: 24px; opacity: 0.5; }

    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-item { font-size: 14px; font-weight: 600; }
    .risk-badge { padding: 6px 12px; background: rgba(0, 0, 0, 0.15); border-radius: 20px; font-size: 12px; }

    /* AI Card (Conseil SmartMove) */
    .ai-card {
      padding: 20px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .ai-icon { font-size: 24px; }
    .ai-header strong { color: #0369a1; font-size: 15px; font-weight: 700; }
    .ai-text { margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.5; font-weight: 500; }

    /* Generic Section */
    .section {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .section-title { margin: 0 0 16px 0; font-size: 15px; color: #1e293b; font-weight: 700; }

    /* Impact List */
    .impact-list { display: flex; flex-direction: column; gap: 14px; }
    .impact-item { display: flex; align-items: center; gap: 12px; }
    .impact-label { width: 90px; font-size: 13px; color: #64748b; font-weight: 600; }
    .impact-bar-bg { flex: 1; height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
    .impact-bar { height: 100%; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
    .impact-bar.traffic { background: #3b82f6; }
    .impact-bar.weather { background: #f59e0b; }
    .impact-bar.incidents { background: #ef4444; }
    .impact-bar.peakhour { background: #8b5cf6; }
    .impact-pct { width: 40px; font-size: 13px; font-weight: 700; color: #1e293b; text-align: right; }

    .impact-info-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 170px;
    }

    .impact-status {
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-low { color: #22c55e; }
    .status-moderate { color: #eab308; }
    .status-high { color: #f97316; }
    .status-critical { color: #ef4444; }

    .weather-details {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      margin-top: 2px;
      white-space: nowrap;
      text-align: right;
    }

    /* Conditions Grid */
    .conditions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .condition { 
      padding: 12px; 
      background: #f8fafc; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      gap: 8px;
      border: 1px solid transparent;
    }
    .cond-icon { font-size: 18px; }
    .cond-text { font-size: 13px; font-weight: 600; color: #475569; }

    .condition.active { background: #fffbeb; border-color: #fef3c7; }
    .condition.active .cond-text { color: #92400e; }
    .condition.warning { background: #fef2f2; border-color: #fee2e2; }
    .condition.warning .cond-text { color: #b91c1c; }
    
    .condition.traffic-fluide { background: #f0fdf4; border-color: #dcfce7; }
    .condition.traffic-fluide .cond-text { color: #166534; }
    .condition.traffic-modéré { background: #fffbeb; border-color: #fef3c7; }
    .condition.traffic-modéré .cond-text { color: #92400e; }
    .condition.traffic-dense { background: #fef2f2; border-color: #fee2e2; }
    .condition.traffic-dense .cond-text { color: #b91c1c; }

    /* Details List */
    .details-list { margin: 0; padding: 0; list-style: none; }
    .detail-item { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 12px 0; 
      font-size: 14px; 
      color: #475569; 
      border-bottom: 1px solid #f1f5f9; 
      font-weight: 500;
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-dot { width: 6px; height: 6px; background: #cbd5e1; border-radius: 50%; }

    /* Animations */
    .animate-fade-in { animation: fadeIn 0.5s ease-out both; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PredictionResultsComponent {
  @Input() prediction: Prediction | null = null;

  formatDuration(minutes: number): string {
    if (!minutes) return '--';
    const totalMinutes = Math.round(minutes);
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${totalMinutes} min`;
  }

  getRiskEmoji(): string {
    if (!this.prediction) return '🟢';
    switch (this.prediction.riskLevel) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟠';
      default: return '🟢';
    }
  }

  getRiskLabel(): string {
    if (!this.prediction) return '';
    switch (this.prediction.riskLevel) {
      case 'HIGH': return 'Risque élevé';
      case 'MEDIUM': return 'Risque moyen';
      default: return 'Risque faible';
    }
  }

  getWeatherIcon(): string {
    if (!this.prediction?.weatherCondition) return '☀️';
    const c = this.prediction.weatherCondition.toLowerCase();
    if (c.includes('rain') || c.includes('pluie')) return '🌧️';
    if (c.includes('cloud') || c.includes('overcast')) return '☁️';
    if (c.includes('fog')) return '🌫️';
    if (c.includes('storm')) return '⛈️';
    return '☀️';
  }

  getWeatherStatusLabel(pct: number): string {
    if (pct >= 40) return '🔴 Impact critique';
    if (pct >= 25) return '🟠 Impact élevé';
    if (pct >= 10) return '🟡 Impact modéré';
    return '🟢 Impact faible';
  }

  getWeatherStatusClass(pct: number): string {
    if (pct >= 40) return 'status-critical';
    if (pct >= 25) return 'status-high';
    if (pct >= 10) return 'status-moderate';
    return 'status-low';
  }

  getIncidentDetails(): string {
    if (!this.prediction) return '';
    if (this.prediction.incidentCount > 0) {
      return `${this.prediction.incidentCount} incident(s) sur la route`;
    }
    return 'Pas d\'impact majeur sur le trajet';
  }

  getWindLabel(): string {
    if (!this.prediction) return 'Vent nul';
    const speed = this.prediction.windSpeed;
    if (speed > 50) return 'Vent violent';
    if (speed > 20) return 'Vent modéré';
    return 'Vent faible';
  }

  getTrafficStatusLabel(pct: number): string {
    if (pct >= 60) return '🔴 Trafic dense';
    if (pct >= 30) return '🟡 Trafic modéré';
    return '🟢 Trafic fluide';
  }

  getTrafficStatusClass(pct: number): string {
    if (pct >= 60) return 'status-critical';
    if (pct >= 30) return 'status-moderate';
    return 'status-low';
  }

  getTrafficDelay(pct: number): number {
    // Academic rule: delay proportional to impact %
    if (!this.prediction) return 0;
    const base = this.prediction.baseDuration || 0;
    return Math.round((pct / 100) * base);
  }

  getIncidentStatusLabel(pct: number): string {
    if (pct >= 50) return '🔴 Trafic bloquant';
    if (pct > 0) return '🟠 Incident signalé';
    return '🟢 Aucun accident';
  }

  getIncidentStatusClass(pct: number): string {
    if (pct >= 50) return 'status-critical';
    if (pct > 0) return 'status-high';
    return 'status-low';
  }

  getPeakHourLabel(pct: number): string {
    if (this.prediction?.isPeakHour) {
      // Common peak hours for Morocco
      const h = new Date().getHours();
      const slot = h < 12 ? '07:30 – 09:30' : '16:30 – 19:00';
      return `🟠 Heure de pointe (${slot})`;
    }
    return '🟢 Heure creuse';
  }

  getPeakHourClass(pct: number): string {
    return this.prediction?.isPeakHour ? 'status-high' : 'status-low';
  }
}
