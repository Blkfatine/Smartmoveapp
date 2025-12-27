/// <reference types="google.maps" />
import { Component, EventEmitter, Output, Input, ViewChild, ElementRef, AfterViewInit, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryService } from '../../services/history.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="planner">
      <div class="planner-header">
        <h3>📍 Planifier un Trajet</h3>
        
        <!-- Bell Icon with Count -->
        <div class="notification-bell" (click)="toggleNotifications()" *ngIf="userId">
          🔔
          <span class="badge" *ngIf="unreadCount > 0">{{unreadCount}}</span>
        </div>
      </div>

      <!-- Notification Panel -->
      <div class="notification-panel" *ngIf="showNotifications">
        <div class="panel-header">
          <h4>Notifications</h4>
          <button (click)="showNotifications = false">✕</button>
        </div>
        <div class="panel-body">
          <div *ngIf="notifications.length === 0" class="no-notif">Aucune notification</div>
          <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read">
            <div class="notif-title">{{n.title}}</div>
            <div class="notif-msg">{{n.message}}</div>
            <div class="notif-time">{{n.timestamp | date:'shortTime'}}</div>
          </div>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" class="planner-form">
        
        <!-- Origin -->
        <div class="field">
          <label>Point de départ</label>
          <div class="input-wrap">
            <span class="dot green"></span>
            <input 
              #originInput
              type="text" 
              [(ngModel)]="origin" 
              name="origin" 
              placeholder="Entrez le point de départ"
            >
            <button type="button" class="loc-btn" (click)="useCurrentLocation()" title="Ma position actuelle">📍</button>
          </div>
        </div>

        <!-- Destination -->
        <div class="field">
          <label>Destination</label>
          <div class="input-wrap">
            <span class="dot red"></span>
            <input 
              #destInput
              type="text" 
              [(ngModel)]="destination" 
              name="destination" 
              placeholder="Entrez la destination"
            >
          </div>
        </div>

        <!-- Date & Time Row -->
        <div class="row">
          <div class="field half">
            <label>Date</label>
            <input type="date" [(ngModel)]="departureDate" name="date">
          </div>
          <div class="field half">
            <label>Heure</label>
            <input type="time" [(ngModel)]="departureTime" name="time">
          </div>
        </div>

        <!-- Transport Mode -->
        <div class="field">
          <label>Mode de transport</label>
          <div class="transport-modes">
            <button type="button" [class.active]="selectedMode === 'driving'" (click)="setMode('driving')" title="Conduite (Traffic intelligent)">
              🚗
            </button>
            <button type="button" [class.active]="selectedMode === 'transit'" (click)="setMode('transit')" title="Transport en commun">
              🚌
            </button>
            <button type="button" [class.active]="selectedMode === 'walking'" (click)="setMode('walking')" title="Marche (Santé)">
              🚶
            </button>
          </div>
        </div>

        <!-- Quick Time Buttons -->
        <div class="quick-btns">
          <button type="button" (click)="setNow()" [class.active]="isNow">⚡ Maintenant</button>
          <button type="button" (click)="setMorningPeak()" [class.active]="isMorningPeak">🌅 8h00</button>
          <button type="button" (click)="setEveningPeak()" [class.active]="isEveningPeak">🌆 18h00</button>
        </div>

        <!-- Action Buttons -->
        <div class="actions">
          <button type="submit" class="submit-btn" [disabled]="!origin || !destination || isLoading">
            <span *ngIf="!isLoading">🔍 Analyser</span>
            <span *ngIf="isLoading">⏳ Analyse...</span>
          </button>
          
          <button type="button" class="monitor-btn" 
                  [disabled]="!origin || !destination" 
                  (click)="onMonitor()"
                  title="Sauvegarder et recevoir des alertes">
            💾 Sauvegarder
          </button>
        </div>

      </form>

      <!-- History Section -->
      <div class="popular">
        <span class="label">Historique:</span>
        <div class="history-list" *ngIf="userId; else loginTemp">
            <div *ngIf="historyRoutes.length === 0" class="empty-history">Aucun historique récent</div>
            <div *ngFor="let r of historyRoutes" class="history-item">
                <div class="history-info" (click)="setRoute(r.originLabel || r.originPlaceId, r.destinationLabel || r.destinationPlaceId)">
                    <span class="history-route">{{r.originLabel}} → {{r.destinationLabel}}</span>
                    <span class="history-mode">{{getModeIcon(r.mode)}}</span>
                </div>
                <button class="track-btn" [class.active]="r.tracked" (click)="toggleTrack(r)" title="Activer/Désactiver notification">
                    {{r.tracked ? '🔔' : '🔕'}}
                </button>
                <button class="del-btn" (click)="deleteHistory(r.id)">✕</button>
            </div>
        </div>
        <ng-template #loginTemp>
            <div class="empty-history">Connectez-vous pour voir votre historique.</div>
        </ng-template>
      </div>

      <div class="info-note">
        💡 Entrez n'importe quelle adresse au Maroc. Google Maps calculera le meilleur itinéraire.
      </div>

    </div>
  `,
  styles: [`
    .planner { padding: 20px; height: 100%; display: flex; flex-direction: column; position: relative; }
    .planner-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .planner-header h3 { margin: 0; font-size: 18px; color: #1e293b; font-weight: 600; }
    
    .notification-bell { position: relative; cursor: pointer; font-size: 20px; }
    .badge { position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; font-size: 10px; padding: 2px 5px; }
    
    .notification-panel {
        position: absolute; top: 50px; right: 20px; width: 300px; background: white; 
        border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; border-radius: 8px;
    }
    .panel-header { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; background: #f8fafc; border-radius: 8px 8px 0 0; }
    .panel-body { max-height: 300px; overflow-y: auto; }
    .notif-item { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
    .notif-item.unread { background: #f0fdf4; border-left: 3px solid #22c55e; }
    .notif-title { font-weight: bold; margin-bottom: 2px; }
    .notif-time { color: #94a3b8; font-size: 10px; text-align: right; }
    
    .planner-form { flex: 1; }
    .field { margin-bottom: 16px; position: relative; }
    .field label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .input-wrap { display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; transition: border-color 0.2s; }
    .input-wrap:focus-within { border-color: #3b82f6; }
    .dot { width: 10px; height: 10px; border-radius: 50%; margin-left: 12px; flex-shrink: 0; }
    .dot.green { background: #22c55e; }
    .dot.red { background: #ef4444; }
    input { flex: 1; border: none; background: none; padding: 12px; font-size: 14px; color: #1e293b; outline: none; }
    input::placeholder { color: #94a3b8; }
    .loc-btn { background: none; border: none; font-size: 16px; cursor: pointer; padding: 0 10px; transition: transform 0.2s; }
    .loc-btn:hover { transform: scale(1.1); }
    .row { display: flex; gap: 12px; }
    .field.half { flex: 1; }
    .field.half input { width: 100%; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    .field.half input:focus { border-color: #3b82f6; }
    .quick-btns { display: flex; gap: 8px; margin-bottom: 16px; }
    .quick-btns button { flex: 1; padding: 10px; background: #f1f5f9; border: 2px solid transparent; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; color: #475569; }
    .quick-btns button:hover { background: #e2e8f0; }
    .quick-btns button.active { background: #dbeafe; border-color: #3b82f6; color: #1d4ed8; }
    .submit-btn { width: 100%; padding: 14px; background: #2563eb; border: none; border-radius: 10px; color: white; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .submit-btn:hover:not(:disabled) { background: #1d4ed8; }
    .submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }
    .popular { margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .popular .label { font-size: 12px; color: #64748b; display: block; margin-bottom: 8px; }
    
    .history-list { display: flex; flex-direction: column; gap: 8px; }
    .history-item { display: flex; align-items: center; background: #f1f5f9; padding: 8px 12px; border-radius: 8px; gap: 8px; }
    .history-info { flex: 1; cursor: pointer; display: flex; flex-direction: column; }
    .history-route { font-size: 12px; color: #334155; font-weight: 500; }
    .history-mode { font-size: 10px; color: #64748b; }
    .track-btn, .del-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 4px; }
    .track-btn:hover, .del-btn:hover { background: #e2e8f0; border-radius: 4px; }
    .track-btn.active { opacity: 1; }
    .track-btn { opacity: 0.5; }
    .empty-history { font-size: 12px; color: #94a3b8; text-align: center; padding: 10px; }

    .actions { display: flex; gap: 10px; }
    .monitor-btn { padding: 14px; background: #f59e0b; border: none; border-radius: 10px; color: white; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; flex: 0 0 auto; }
    .monitor-btn:hover:not(:disabled) { background: #d97706; }
    .monitor-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
    .transport-modes {
      display: flex;
      gap: 10px;
      margin-bottom: 2px;
    }
    .transport-modes button {
      flex: 1;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      font-size: 24px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .transport-modes button:hover {
      background: #f8fafc;
      transform: translateY(-2px);
    }
    .transport-modes button.active {
      background: #eff6ff;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px #3b82f6;
    }
    .info-note { margin-top: 16px; padding: 12px; background: #fef9c3; border-radius: 8px; font-size: 11px; color: #854d0e; line-height: 1.4; }
  `]
})
export class TripPlannerComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() isLoading = false;
  @Output() planTrip = new EventEmitter<any>(); 
  @Output() monitorTrip = new EventEmitter<{ origin: string, destination: string }>();

  @ViewChild('originInput') originInput!: ElementRef;
  @ViewChild('destInput') destInput!: ElementRef;

  origin = '';
  destination = '';
  
  userId: string | null = null;
  historyRoutes: any[] = [];
  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;

  private sseSubscription?: Subscription;

  constructor(
    private ngZone: NgZone,
    private historyService: HistoryService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  departureDate = new Date().toISOString().split('T')[0];
  departureTime = this.getCurrentTime();

  isNow = true;
  isMorningPeak = false;
  isEveningPeak = false;
  
  selectedMode: string = 'driving';
  originCoords: { lat: number, lng: number } | null = null;

  ngOnInit() {
      const username = this.authService.getUsername();
      if (username) {
          this.userId = username;
          this.loadHistory();
          this.connectNotifications();
      }
  }

  ngOnDestroy() {
      if (this.sseSubscription) {
          this.sseSubscription.unsubscribe();
      }
  }

  loadHistory() {
      if (!this.userId) return;
      this.historyService.getHistory().subscribe({
          next: (data) => this.historyRoutes = data,
          error: (err) => console.error('Failed to load history', err)
      });
  }

  connectNotifications() {
      if (!this.userId) return;
      this.notificationService.getNotifications(this.userId).subscribe(
          data => this.notifications = data
      );
      
      this.sseSubscription = this.notificationService.getServerSentEvent(this.userId).subscribe({
         next: (event) => {
             console.log('SSE Event:', event);
             if (event.title) { // Assuming it's a notification
                 this.notifications.unshift(event);
                 this.unreadCount++;
             }
         },
         error: (err) => console.error('SSE Error', err)
      });
  }

  toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
          this.unreadCount = 0; // Reset count on open
      }
  }

  ngAfterViewInit() {
    this.initAutocomplete();
  }
  
  setMode(mode: string): void {
    this.selectedMode = mode;
  }

  // ... (initAutocomplete remains the same)

  initAutocomplete() {
    if (!this.originInput || !this.destInput) return;

    const options = {
      fields: ["formatted_address", "name", "geometry"], // Added request for geometry
      componentRestrictions: { country: "ma" }
    };

    const originAutocomplete = new google.maps.places.Autocomplete(this.originInput.nativeElement, options);
    const destAutocomplete = new google.maps.places.Autocomplete(this.destInput.nativeElement, options);

    originAutocomplete.addListener("place_changed", () => {
      const place = originAutocomplete.getPlace();
      if (place.formatted_address) {
        this.origin = place.formatted_address;
        if (place.geometry && place.geometry.location) {
             this.originCoords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        }
      }
    });

    destAutocomplete.addListener("place_changed", () => {
      const place = destAutocomplete.getPlace();
      if (place.formatted_address) {
        this.destination = place.formatted_address;
      }
    });
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      this.origin = 'Localisation en cours...';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          this.originCoords = pos; // Save exact coords

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              this.ngZone.run(() => {
                  this.origin = results[0].formatted_address;
              });
            } else {
              this.ngZone.run(() => {
                  this.origin = `${pos.lat}, ${pos.lng}`;
              });
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.origin = 'Erreur de géolocalisation';
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert("Votre navigateur ne supporte pas la géolocalisation.");
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');
  }

  onSubmit() {
    if (this.origin && this.destination) {
      this.planTrip.emit({
        origin: this.origin,
        destination: this.destination,
        date: this.departureDate,
        time: this.departureTime,
        transportMode: this.selectedMode,
        originCoords: this.originCoords
      });
      
      // Auto-save to history on submit
      this.addToHistory();
    }
  }
  
  addToHistory() {
      if (!this.userId) return;
      
      const route = {
          originLabel: this.origin,
          originPlaceId: this.origin, // Simplified
          destinationLabel: this.destination,
          destinationPlaceId: this.destination, // Simplified
          mode: this.selectedMode,
          tracked: false
      };
      
      this.historyService.addToHistory(route).subscribe({
          next: () => this.loadHistory(),
          error: (err) => console.error('Error saving history', err)
      });
  }

  onMonitor() {
    if (this.origin && this.destination) {
      // Prioritize saving/monitoring
      if (!this.userId) {
          alert('Veuillez vous connecter pour sauvegarder et suivre des trajets.');
          return;
      }
      
      const route = {
          originLabel: this.origin,
          originPlaceId: this.origin,
          destinationLabel: this.destination,
          destinationPlaceId: this.destination,
          mode: this.selectedMode,
          tracked: true // Enable tracking immediately
      };

      this.historyService.addToHistory(route).subscribe({
          next: (savedRoute) => {
              this.loadHistory();
              alert('Trajet sauvegardé et suivi activé !');
              // Optional: still emit monitorTrip if parent needs it
              this.monitorTrip.emit({ origin: this.origin, destination: this.destination });
          },
          error: (err) => alert('Erreur lors de la sauvegarde.')
      });
    }
  }

  setNow() {
    this.departureTime = this.getCurrentTime();
    this.departureDate = new Date().toISOString().split('T')[0];
    this.isNow = true; this.isMorningPeak = false; this.isEveningPeak = false;
  }

  setMorningPeak() {
    this.departureTime = '08:00';
    this.isNow = false; this.isMorningPeak = true; this.isEveningPeak = false;
  }

  setEveningPeak() {
    this.departureTime = '18:00';
    this.isNow = false; this.isMorningPeak = false; this.isEveningPeak = true;
  }

  setRoute(origin: string, destination: string) {
    this.origin = origin;
    this.destination = destination;
  }

  deleteHistory(id: number) {
      if(confirm('Supprimer ce trajet de l\'historique ?')) {
          this.historyService.deleteFromHistory(id).subscribe(() => this.loadHistory());
      }
  }

  toggleTrack(route: any) {
      // Toggle logic
      const newValue = !route.tracked;
      this.historyService.toggleTracking(route.id, newValue).subscribe({
          next: (updated) => {
              route.tracked = updated.tracked;
          }
      });
  }

  getModeIcon(mode: string): string {
      switch(mode) {
          case 'driving': return '🚗';
          case 'walking': return '🚶';
          case 'transit': return '🚌';
          case 'bicycling': return '🚲';
          default: return '📍';
      }
  }
}

