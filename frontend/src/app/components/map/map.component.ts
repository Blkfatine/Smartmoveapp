
import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat'; // Import heat plugin
import { PredictionService, Prediction } from '../../services/prediction.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-map',
    standalone: true,
    template: '<div id="map"></div>',
    styles: [`
    #map {
      height: 600px;
      width: 100%;
      border-radius: 8px;
    }
    ::ng-deep .custom-div-icon {
        background: transparent;
        border: none;
    }
  `]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
    private map!: L.Map;
    private predictionService = inject(PredictionService);
    private subscription!: Subscription;
    private markers: L.Marker[] = [];

    // Layers
    private trafficLayer!: L.LayerGroup;
    private heatLayer!: any; // L.heatLayer
    private weatherLayer!: L.LayerGroup;

    constructor() { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.initMap();
        this.startUpdates();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private initMap(): void {
        this.map = L.map('map', {
            center: [33.5731, -7.5898], // Casablanca coordinates
            zoom: 13
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Initialize Layers
        this.initLayers();

        // Add Control
        const overlayMaps = {
            "Trafic Temps Réel": this.trafficLayer,
            "Densité (Heatmap)": this.heatLayer,
            "Météo": this.weatherLayer
        };
        L.control.layers(undefined, overlayMaps).addTo(this.map);
    }

    private startUpdates(): void {
        this.subscription = this.predictionService.getPredictions().subscribe(predictions => {
            this.updateMarkers(predictions);
        });
    }

    private updateMarkers(predictions: Prediction[]): void {
        // Clear existing markers
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];

        predictions.forEach(p => {
            // For demo, we'll just put a marker at a random spot near Casablanca if coords aren't provided
            // In real app, origin/dest would be coordinates or geocoded
            const lat = 33.5731 + (Math.random() - 0.5) * 0.05;
            const lng = -7.5898 + (Math.random() - 0.5) * 0.05;

            const color = p.riskLevel === 'HIGH' ? 'red' : 'green';

            // Custom icon based on risk
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:${color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5]
            });

            const marker = L.marker([lat, lng]).addTo(this.map);
            marker.bindPopup(`
        <b>Trajet: ${p.origin} -> ${p.destination}</b><br>
        Durée: ${p.predictedDuration.toFixed(0)} min<br>
        Risque: <span style="color:${color}">${p.riskLevel}</span>
      `).openPopup();

            this.markers.push(marker);
        });
    }

    private initLayers(): void {
        // 1. Traffic Layer (MOCKED VISUALS)
        this.trafficLayer = L.layerGroup().addTo(this.map);

        // Simulate heavy traffic (Red Polylines)
        const congestionRoutes = [
            [[33.57, -7.60], [33.58, -7.59]],
            [[33.59, -7.61], [33.585, -7.605]]
        ];

        congestionRoutes.forEach(route => {
            L.polyline(route as L.LatLngExpression[], { color: 'red', weight: 5, opacity: 0.7 })
                .bindPopup('Traffic Dense: Vitesse moy. 15km/h')
                .addTo(this.trafficLayer);
        });

        // 2. Weather Layer (MOCKED VISUALS)
        this.weatherLayer = L.layerGroup();
        // Custom simple icons (using DivIcon to simulate emoji markers)
        const rainIcon = L.divIcon({
            html: '<div style="font-size: 24px;">🌧️</div>',
            className: 'custom-div-icon',
            iconSize: [30, 30]
        });

        L.marker([33.58, -7.62], { icon: rainIcon }).bindPopup('Averse locale').addTo(this.weatherLayer);
        L.marker([33.56, -7.58], { icon: rainIcon }).bindPopup('Pluie légère').addTo(this.weatherLayer);

        // 3. Heatmap Layer (MOCKED VISUALS)
        const heatPoints: [number, number, number][] = [];
        for (let i = 0; i < 300; i++) {
            heatPoints.push([
                33.5731 + (Math.random() - 0.5) * 0.08,
                -7.5898 + (Math.random() - 0.5) * 0.08,
                Math.random() * 0.8 // Intensity
            ]);
        }

        // @ts-ignore
        this.heatLayer = L.heatLayer(heatPoints, { radius: 20, blur: 15, maxZoom: 17 });

        // 4. Incidents (MOCKED - Extra Layer added to traffic)
        const accidentIcon = L.divIcon({
            html: '<div style="font-size: 24px;">⚠️</div>',
            className: 'custom-div-icon',
            iconSize: [30, 30]
        });
        L.marker([33.575, -7.595], { icon: accidentIcon }).bindPopup('Accident: 2 voies bloquées').addTo(this.trafficLayer);
    }
}
