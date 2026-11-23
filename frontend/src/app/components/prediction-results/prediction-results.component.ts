import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionUIModel, RouteOptionUI } from '../../models/prediction-ui.model';

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
            <span class="duration-value">{{ formatDuration(prediction.durationMinutes) }}</span>
            <span class="duration-label">
              {{ prediction.mode === 'transit' ? 'Transport (Casabus / Tram)' : (prediction.mode === 'walking' ? 'Marche à pied' : 'Voiture') }}
            </span>
          </div>
        </div>
        
        <div class="time-row">
          <div class="time-item">
            <span>🏁 Arrivée estimée</span>
            <strong>{{ prediction.arrivalTime }}</strong>
          </div>
          <div class="time-item" *ngIf="prediction.dataStatus.hasTraffic">
            <span>🚦 Retard Trafic</span>
            <strong>+{{ prediction.trafficDelayMinutes }} min</strong>
          </div>
        </div>
        
        <div class="info-row">
          <span class="info-item">📍 {{ prediction.distanceKm | number:'1.1-1' }} km</span>
          <span class="info-item risk-badge">
            {{ getRiskEmoji() }} {{ getRiskLabel() }}
          </span>
        </div>
      </div>

      <!-- MULTI-ROUTE OPTIONS CHOOSER (User Choice) -->
      <div class="section-box animate-slide-up delay-1" *ngIf="prediction.routeOptions && prediction.routeOptions.length > 0">
        <div class="section-header">
          <h4 class="section-title">🛣️ Choisir un Itinéraire ({{ prediction.routeOptions.length }} options)</h4>
          <span class="section-hint">Cliquez pour basculer</span>
        </div>

        <div class="route-options-list">
          <div 
            *ngFor="let opt of prediction.routeOptions" 
            class="route-card" 
            [class.active]="opt.selected"
            (click)="onChooseRoute(opt)"
          >
            <div class="route-card-head">
              <span class="opt-badge" [class]="'badge-' + opt.badgeType">{{ opt.badge }}</span>
              <span class="diff-tag" [class.faster]="opt.diffMinutes && opt.diffMinutes < 0" [class.slower]="opt.diffMinutes && opt.diffMinutes > 0">
                <ng-container *ngIf="opt.diffMinutes === 0">⭐ Référence</ng-container>
                <ng-container *ngIf="opt.diffMinutes && opt.diffMinutes < 0">{{ opt.diffMinutes }} min (Plus rapide)</ng-container>
                <ng-container *ngIf="opt.diffMinutes && opt.diffMinutes > 0">+{{ opt.diffMinutes }} min</ng-container>
              </span>
            </div>

            <div class="route-card-body">
              <div class="route-info">
                <span class="mode-emoji">{{ getModeEmoji(opt.mode) }}</span>
                <div class="route-text">
                  <strong class="opt-title">{{ opt.title }}</strong>
                  <span class="opt-summary">{{ opt.summary }}</span>
                </div>
              </div>

              <div class="route-metrics">
                <span class="opt-duration">{{ formatDuration(opt.durationMinutes) }}</span>
                <span class="opt-arrival">Arrivée {{ opt.arrivalTime }}</span>
              </div>
            </div>

            <div class="route-card-foot">
              <span class="foot-item">📍 {{ opt.distanceKm | number:'1.1-1' }} km</span>
              <span class="foot-traffic" [class]="getTrafficClassForLevel(opt.trafficLevel)">
                {{ opt.trafficLevel === 'HEAVY' ? 'Bouchons (+ ' + opt.trafficDelayMinutes + ' min)' : (opt.trafficLevel === 'MODERATE' ? 'Ralenti (+ ' + opt.trafficDelayMinutes + ' min)' : 'Fluide') }}
              </span>
              <span class="foot-transit" *ngIf="opt.transitLine">
                🚌 {{ opt.transitLine }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- PUBLIC TRANSIT STEP-BY-STEP GUIDE (Casabus & Tramway) -->
      <div class="section-box transit-guide animate-slide-up delay-2" *ngIf="prediction.transitDetails">
        <h4 class="section-title">🚌 Guide Transport : {{ prediction.transitDetails.line }}</h4>
        
        <div class="transit-meta-card">
          <div class="transit-meta-top">
            <span class="operator-badge">{{ prediction.transitDetails.operator }}</span>
            <span class="fare-badge">🎟️ {{ prediction.transitDetails.fare }}</span>
          </div>
          <div class="transit-meta-stats">
            <span>⏱️ {{ prediction.transitDetails.frequency }}</span>
            <span>🚏 {{ prediction.transitDetails.stopsCount }} arrêts au total</span>
          </div>
        </div>

        <div class="transit-timeline">
          <div class="timeline-step" *ngFor="let step of prediction.transitDetails.steps; let idx = index">
            <div class="step-icon-wrap" [class.bus]="step.type === 'bus'" [class.tram]="step.type === 'tram'" [class.walk]="step.type === 'walk'">
              {{ step.type === 'walk' ? '🚶' : (step.type === 'tram' ? '🚊' : '🚌') }}
            </div>
            <div class="step-details">
              <div class="step-instruction">{{ step.instruction }}</div>
              <div class="step-duration">⏱️ ~{{ step.durationMinutes }} min</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advice Card -->
      <div class="ai-card animate-slide-up delay-3" [class]="'type-' + prediction.advice.type">
        <div class="ai-header">
           <span class="ai-icon">💡</span>
           <strong>{{ prediction.advice.title }}</strong>
        </div>
        <p class="ai-text">{{ prediction.advice.text }}</p>
      </div>

      <!-- Details Section -->
      <div class="section-box animate-slide-up delay-4">
        <h4 class="section-title">📊 Facteurs d'Analyse</h4>
        
        <div class="impact-list">
            <!-- Traffic -->
            <div class="impact-item">
                <span class="impact-label">Trafic</span>
                <div class="impact-content">
                    <span class="status-text" [class]="getTrafficClass()">
                        {{ prediction.trafficLevel }} 
                        <span *ngIf="prediction.dataStatus.hasTraffic">({{ prediction.trafficDelayMinutes }} min délai)</span>
                    </span>
                </div>
            </div>

            <!-- Weather -->
            <div class="impact-item">
                <span class="impact-label">Météo</span>
                <div class="impact-content">
                    <span class="status-text" [class]="getWeatherClass()">
                        {{ prediction.weatherSummary }}
                        <span *ngIf="prediction.currentTemp">({{ prediction.currentTemp }}°C)</span>
                    </span>
                </div>
            </div>

            <!-- Reliability/Confidence -->
            <div class="impact-item">
                <span class="impact-label">Fiabilité</span>
                <div class="impact-content">
                    <span class="confidence-badge" [class]="'conf-' + prediction.confidenceLevel.toLowerCase()">
                        {{ prediction.confidenceLevel }}
                    </span>
                </div>
            </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .results { padding-bottom: 24px; }
    
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
    .main-card.risk-medium { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 10px 30px rgba(217, 119, 6, 0.3); }
    .main-card.risk-high { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3); }

    .duration-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .duration-icon { font-size: 40px; }
    .duration-info { display: flex; flex-direction: column; }
    .duration-value { font-size: 38px; font-weight: 800; line-height: 1; }
    .duration-label { font-size: 13px; opacity: 0.9; text-transform: uppercase; font-weight: 600; margin-top: 4px; }

    .time-row { display: flex; justify-content: space-between; background: rgba(0,0,0,0.1); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .time-item { display: flex; flex-direction: column; }
    .time-item span { font-size: 11px; opacity: 0.8; text-transform: uppercase; font-weight: 600; }
    .time-item strong { font-size: 18px; font-weight: 700; }

    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-item { font-size: 14px; font-weight: 600; }
    .risk-badge { padding: 4px 10px; background: rgba(0,0,0,0.15); border-radius: 20px; font-size: 12px; }

    /* Common Section Box */
    .section-box {
      background: white;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      border: 1px solid #f1f5f9;
    }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-title { margin: 0; font-size: 15px; font-weight: 800; color: #1e293b; }
    .section-hint { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }

    /* Route Cards */
    .route-options-list { display: flex; flex-direction: column; gap: 12px; }
    .route-card {
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: #fafafa;
    }
    .route-card:hover {
      border-color: #93c5fd;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.08);
    }
    .route-card.active {
      border-color: #2563eb;
      background: #eff6ff;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
    }
    .route-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .opt-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .badge-primary { background: #dbeafe; color: #1d4ed8; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-info { background: #e0f2fe; color: #0369a1; }

    .diff-tag { font-size: 11px; font-weight: 700; color: #64748b; }
    .diff-tag.faster { color: #16a34a; }
    .diff-tag.slower { color: #dc2626; }

    .route-card-body { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .route-info { display: flex; gap: 10px; align-items: flex-start; flex: 1; }
    .mode-emoji { font-size: 22px; line-height: 1; }
    .route-text { display: flex; flex-direction: column; gap: 2px; }
    .opt-title { font-size: 13px; color: #0f172a; line-height: 1.3; }
    .opt-summary { font-size: 11px; color: #64748b; }

    .route-metrics { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
    .opt-duration { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1; }
    .opt-arrival { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 3px; }

    .route-card-foot {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
    }
    .foot-traffic { color: #ca8a04; }
    .foot-traffic.status-bad { color: #dc2626; }
    .foot-traffic.status-good { color: #16a34a; }
    .foot-transit { background: #fed7aa; color: #9a3412; padding: 2px 6px; border-radius: 4px; font-weight: 700; }

    /* Transit Guide Section */
    .transit-guide { border-left: 4px solid #ea580c; }
    .transit-meta-card {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 14px;
    }
    .transit-meta-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .operator-badge { font-size: 12px; font-weight: 700; color: #9a3412; }
    .fare-badge { font-size: 12px; font-weight: 800; color: #c2410c; background: white; padding: 2px 8px; border-radius: 6px; }
    .transit-meta-stats { display: flex; gap: 14px; font-size: 11px; color: #7c2d12; font-weight: 600; }

    .transit-timeline { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .timeline-step { display: flex; align-items: flex-start; gap: 10px; }
    .step-icon-wrap {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      background: #f1f5f9;
      flex-shrink: 0;
    }
    .step-icon-wrap.bus { background: #dbeafe; }
    .step-icon-wrap.tram { background: #dcfce7; }
    .step-icon-wrap.walk { background: #fef3c7; }
    .step-details { flex: 1; }
    .step-instruction { font-size: 12px; font-weight: 600; color: #1e293b; line-height: 1.3; }
    .step-duration { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* Advice Card */
    .ai-card { padding: 18px; background: #f0f9ff; border-radius: 20px; margin-bottom: 18px; border-left: 5px solid #0ea5e9; }
    .ai-card.type-warning { background: #fffbeb; border-left-color: #f59e0b; }
    .ai-card.type-danger { background: #fef2f2; border-left-color: #ef4444; }
    .ai-card.type-success { background: #f0fdf4; border-left-color: #22c55e; }
    .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .ai-icon { font-size: 20px; }
    .ai-text { margin: 0; font-size: 13px; color: #334155; line-height: 1.5; }

    /* Impact List */
    .impact-list { display: flex; flex-direction: column; gap: 12px; }
    .impact-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    .impact-item:last-child { border-bottom: none; padding-bottom: 0; }
    .impact-label { width: 80px; font-size: 13px; font-weight: 600; color: #64748b; }
    .impact-content { flex: 1; text-align: right; }
    .status-text { font-size: 13px; font-weight: 600; }
    .status-good { color: #16a34a; }
    .status-mod { color: #ca8a04; }
    .status-bad { color: #dc2626; }
    .confidence-badge { padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; }
    .conf-high { background: #dcfce7; color: #166534; }
    .conf-medium { background: #fef3c7; color: #92400e; }
    .conf-low { background: #fee2e2; color: #991b1b; }

    .animate-fade-in { animation: fadeIn 0.4s ease-out both; }
    .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .delay-1 { animation-delay: 0.08s; }
    .delay-2 { animation-delay: 0.16s; }
    .delay-3 { animation-delay: 0.24s; }
    .delay-4 { animation-delay: 0.32s; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PredictionResultsComponent {
  @Input() prediction: PredictionUIModel | null = null;
  @Output() selectRoute = new EventEmitter<RouteOptionUI>();

  onChooseRoute(option: RouteOptionUI): void {
    this.selectRoute.emit(option);
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '--';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}min`;
    return `${m} min`;
  }

  getModeEmoji(mode: string): string {
    if (mode === 'walking') return '🚶';
    if (mode === 'transit') return '🚌';
    return '🚗';
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
      case 'HIGH': return 'Risque Élevé';
      case 'MEDIUM': return 'Risque Modéré';
      default: return 'Risque Faible';
    }
  }

  getTrafficClass(): string {
    if (!this.prediction) return '';
    return this.getTrafficClassForLevel(this.prediction.trafficLevel);
  }

  getTrafficClassForLevel(level: string): string {
    switch(level) {
      case 'HEAVY': return 'status-bad';
      case 'MODERATE': return 'status-mod';
      case 'FLUID': return 'status-good';
      default: return '';
    }
  }

  getWeatherClass(): string {
    if (!this.prediction) return '';
    switch(this.prediction.weatherImpactLevel) {
      case 'HIGH': return 'status-bad';
      case 'MEDIUM': return 'status-mod';
      default: return 'status-good';
    }
  }
}
