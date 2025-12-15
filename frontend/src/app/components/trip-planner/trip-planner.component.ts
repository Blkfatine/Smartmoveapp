
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card p-3 mb-3 shadow-sm bg-light">
      <h5 class="card-title text-primary mb-3"><i class="bi bi-geo-alt-fill"></i> Planifier un Trajet</h5>
      <form (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label text-muted small fw-bold">POINT DE DÉPART</label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-circle text-success"></i></span>
            <select class="form-select border-start-0 ps-0" [(ngModel)]="origin" name="origin">
                <option *ngFor="let loc of locations" [value]="loc">{{loc}}</option>
            </select>
          </div>
        </div>
        
        <div class="mb-3">
          <label class="form-label text-muted small fw-bold">DESTINATION</label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-geo-alt text-danger"></i></span>
            <select class="form-select border-start-0 ps-0" [(ngModel)]="destination" name="destination">
                <option *ngFor="let loc of locations" [value]="loc">{{loc}}</option>
            </select>
          </div>
        </div>

        <div class="row g-2 mb-3">
            <div class="col-6">
                <label class="form-label text-muted small fw-bold">DATE</label>
                <input type="date" class="form-control" [(ngModel)]="departureDate" name="date">
            </div>
            <div class="col-6">
                <label class="form-label text-muted small fw-bold">HEURE</label>
                <input type="time" class="form-control" [(ngModel)]="departureTime" name="time">
            </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" [disabled]="!origin || !destination || isLoading">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span *ngIf="!isLoading"><i class="bi bi-search"></i> Prédire Durée</span>
          <span *ngIf="isLoading">Analyse en cours...</span>
        </button>
      </form>
    </div>
  `,
  styles: []
})
export class TripPlannerComponent {
  @Input() isLoading = false;
  @Output() planTrip = new EventEmitter<{ origin: string, destination: string, date: string, time: string }>();

  origin: string = 'Maarif';
  destination: string = 'Technopark';
  departureDate: string = new Date().toISOString().split('T')[0];
  departureTime: string = '08:30';

  locations = ['Maarif', 'Technopark', 'Ain Diab', 'Sidi Maarouf', 'Centre Ville', 'Casa Port'];

  onSubmit() {
    if (this.origin && this.destination) {
      this.planTrip.emit({
        origin: this.origin,
        destination: this.destination,
        date: this.departureDate,
        time: this.departureTime
      });
    }
  }
}
