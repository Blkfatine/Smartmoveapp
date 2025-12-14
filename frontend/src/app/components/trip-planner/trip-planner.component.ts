
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-trip-planner',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card p-3 mb-3 shadow-sm bg-light">
      <h5 class="card-title text-primary"><i class="bi bi-geo-alt-fill"></i> Planifier un Trajet</h5>
      <form (ngSubmit)="onSubmit()">
        <div class="mb-2">
          <label class="form-label">Point de départ</label>
          <select class="form-select" [(ngModel)]="origin" name="origin">
            <option *ngFor="let loc of locations" [value]="loc">{{loc}}</option>
          </select>
        </div>
        <div class="mb-2">
          <label class="form-label">Destination</label>
          <select class="form-select" [(ngModel)]="destination" name="destination">
            <option *ngFor="let loc of locations" [value]="loc">{{loc}}</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary w-100" [disabled]="!origin || !destination">
          <i class="bi bi-search"></i> Prédire Durée
        </button>
      </form>
    </div>
  `,
    styles: [`
    .card { border-radius: 10px; border: none; }
  `]
})
export class TripPlannerComponent {
    @Output() planTrip = new EventEmitter<{ origin: string, destination: string }>();

    origin: string = 'Maarif';
    destination: string = 'Technopark';
    locations = ['Maarif', 'Technopark', 'Ain Diab', 'Sidi Maarouf', 'Centre Ville', 'Casa Port'];

    onSubmit() {
        if (this.origin && this.destination) {
            this.planTrip.emit({ origin: this.origin, destination: this.destination });
        }
    }
}
