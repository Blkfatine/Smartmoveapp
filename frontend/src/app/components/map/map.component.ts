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
    private incidentsLayer!: L.LayerGroup;

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
            "Incidents": this.incidentsLayer,
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
        // 1. Clear ALL existing dynamic markers
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];

        this.map.eachLayer((layer: any) => {
            if (layer._routeLine) {
                this.map.removeLayer(layer);
            }
        });

        this.weatherLayer.clearLayers();
        this.incidentsLayer.clearLayers();

        const routeFeatureGroup = L.featureGroup();

        predictions.forEach(p => {
            // A. Draw Polyline (Route)
            if (p.routeGeometry && p.routeGeometry.length > 0) {
                const routePoints = p.routeGeometry.map((pt: any) => [pt.latitude, pt.longitude] as [number, number]);
                const routeColor = p.riskLevel === 'HIGH' ? '#ef4444' : (p.riskLevel === 'MEDIUM' ? '#f59e0b' : '#3b82f6');

                const polyline = L.polyline(routePoints, {
                    color: routeColor,
                    weight: 6,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(this.map);

                (polyline as any)._routeLine = true;
                routeFeatureGroup.addLayer(polyline);
            }

            // B. Add Markers for Origin and Destination
            let startLat = 33.5731, startLng = -7.5898;
            let endLat = 33.5731, endLng = -7.5898;

            if (p.routeGeometry && p.routeGeometry.length > 0) {
                const start = p.routeGeometry[0] as any;
                const end = p.routeGeometry[p.routeGeometry.length - 1] as any;
                startLat = start.latitude;
                startLng = start.longitude;
                endLat = end.latitude;
                endLng = end.longitude;
            }

            // Origin Marker
            const originIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:#10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
            const originMarker = L.marker([startLat, startLng], { icon: originIcon }).bindPopup(`<b>Départ:</b> ${p.origin}`).addTo(this.map);
            routeFeatureGroup.addLayer(originMarker);

            // Destination Marker
            const destIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:#ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
            const destMarker = L.marker([endLat, endLng], { icon: destIcon }).bindPopup(`<b>Arrivée:</b> ${p.destination}`).addTo(this.map);
            this.markers.push(destMarker);
            routeFeatureGroup.addLayer(destMarker);

            // C. Add Dynamic Weather Markers
            if (p.weatherCondition) {
                const weatherIcon = L.divIcon({
                    html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${this.getWeatherEmoji(p.weatherCondition)}</div>`,
                    className: 'custom-div-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                L.marker([startLat, startLng], { icon: weatherIcon, zIndexOffset: 1000 })
                    .bindPopup(`<b>Météo au départ:</b> ${p.weatherCondition} (${p.temperature}°C)`)
                    .addTo(this.weatherLayer);

                if (p.distanceKm > 10) {
                    L.marker([endLat, endLng], { icon: weatherIcon, zIndexOffset: 1000 })
                        .bindPopup(`<b>Météo à l'arrivée:</b> ${p.weatherCondition} (${p.temperature}°C)`)
                        .addTo(this.weatherLayer);
                }
            }

            // D. Add Dynamic Incidents
            if (p.hasIncidents && p.routeGeometry && p.routeGeometry.length > 5) {
                const midPoint = p.routeGeometry[Math.floor(p.routeGeometry.length / 2)];
                const accidentIcon = L.divIcon({
                    html: '<div style="font-size: 28px; filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6));">⚠️</div>',
                    className: 'custom-div-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                L.marker([midPoint.latitude, midPoint.longitude], { icon: accidentIcon, zIndexOffset: 1100 })
                    .bindPopup(`<b>Incident détecté:</b> ${p.incidentCount} événement(s) en temps réel.`)
                    .addTo(this.incidentsLayer);
            }
        });

        // 2. Fit bounds to show everything
        if (routeFeatureGroup.getLayers().length > 0) {
            this.map.fitBounds(routeFeatureGroup.getBounds(), { padding: [50, 50] });
        }
    }

    private initLayers(): void {
        this.trafficLayer = L.layerGroup().addTo(this.map);

        // Decoration: background traffic feel
        const backgroundTrafic = [[[33.57, -7.60], [33.58, -7.59]], [[33.59, -7.61], [33.585, -7.605]]];
        backgroundTrafic.forEach(route => {
            L.polyline(route as L.LatLngExpression[], { color: 'red', weight: 4, opacity: 0.4 })
                .bindPopup('Trafic historique élevé')
                .addTo(this.trafficLayer);
        });

        this.weatherLayer = L.layerGroup().addTo(this.map);
        this.incidentsLayer = L.layerGroup().addTo(this.map);

        // Heatmap
        const heatPoints: [number, number, number][] = [];
        for (let i = 0; i < 300; i++) {
            heatPoints.push([
                33.5731 + (Math.random() - 0.5) * 0.08,
                -7.5898 + (Math.random() - 0.5) * 0.08,
                Math.random() * 0.8
            ]);
        }
        // @ts-ignore
        this.heatLayer = L.heatLayer(heatPoints, { radius: 20, blur: 15, maxZoom: 17 });
    }

    private getWeatherEmoji(condition: string): string {
        const c = (condition || '').toLowerCase();
        if (c.includes('rain') || c.includes('pluie')) return '🌧️';
        if (c.includes('cloud') || c.includes('overcast')) return '☁️';
        if (c.includes('fog') || c.includes('brouillard')) return '🌫️';
        if (c.includes('storm') || c.includes('orage')) return '⛈️';
        if (c.includes('snow') || c.includes('neige')) return '❄️';
        return '☀️';
    }
}
