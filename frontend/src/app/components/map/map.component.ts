import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';
import { MeteoService } from '../../services/meteo.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  private map!: L.Map;
  private currentPolyline: L.Polyline | null = null;
  private alternativePolylines: L.Polyline[] = [];
  private transitMarkers: L.CircleMarker[] = [];
  private startMarker: L.CircleMarker | null = null;
  private endMarker: L.CircleMarker | null = null;
  private userMarker: L.CircleMarker | null = null;

  showTraffic = false;
  weatherData: any = null;

  // Default center: Casablanca, Morocco
  defaultCenter = { lat: 33.5731, lng: -7.5898 };

  // Fallback coordinates for Moroccan locations
  private moroccanCoords: { [key: string]: { lat: number, lng: number } } = {
    'maarif': { lat: 33.5833, lng: -7.6333 },
    'casa port': { lat: 33.6033, lng: -7.6164 },
    'technopark': { lat: 33.5167, lng: -7.6500 },
    'ain diab': { lat: 33.5900, lng: -7.6700 },
    'anfa': { lat: 33.5783, lng: -7.6481 },
    'centre ville': { lat: 33.5950, lng: -7.6200 },
    'sidi maarouf': { lat: 33.5350, lng: -7.6650 },
    'bourgogne': { lat: 33.5800, lng: -7.6250 },
    'racine': { lat: 33.5850, lng: -7.6350 },
    'gauthier': { lat: 33.5870, lng: -7.6280 },
    'oasis': { lat: 33.5650, lng: -7.6450 },
    'hay hassani': { lat: 33.5550, lng: -7.6800 },
    'casablanca': { lat: 33.5731, lng: -7.5898 },
    'rabat': { lat: 34.0209, lng: -6.8416 },
    'marrakech': { lat: 31.6295, lng: -7.9811 },
    'tanger': { lat: 35.7595, lng: -5.8340 },
    'fes': { lat: 34.0181, lng: -5.0078 },
    'agadir': { lat: 30.4278, lng: -9.5981 },
    'el jadida': { lat: 33.2549, lng: -8.5074 },
    'mohammedia': { lat: 33.6861, lng: -7.3833 }
  };

  constructor(
    private meteoService: MeteoService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.updateWeather(this.defaultCenter.lat, this.defaultCenter.lng, 'Casablanca');
  }

  ngAfterViewInit(): void {
    // Delay initialization slightly to ensure DOM element is ready
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = L.map('map', {
      center: [this.defaultCenter.lat, this.defaultCenter.lng],
      zoom: 13,
      zoomControl: true
    });

    // Free OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.getUserLocation();
  }

  public calculateRoute(
    originCoords: { lat: number, lng: number },
    destination: string,
    transportMode: string = 'driving'
  ): Observable<any> {
    this.updateWeather(originCoords.lat, originCoords.lng, 'Départ');

    return this.geocode(destination).pipe(
      switchMap(destCoords => {
        if (!destCoords) return of(null);
        return this.fetchOsrmRoute(originCoords, destCoords, transportMode);
      })
    );
  }

  public calculateRouteFromStrings(
    origin: string,
    destination: string,
    transportMode: string = 'driving'
  ): Observable<any> {
    return this.geocode(origin).pipe(
      switchMap(originCoords => {
        if (!originCoords) return of(null);
        this.updateWeather(originCoords.lat, originCoords.lng, origin);

        return this.geocode(destination).pipe(
          switchMap(destCoords => {
            if (!destCoords) return of(null);
            return this.fetchOsrmRoute(originCoords, destCoords, transportMode);
          })
        );
      })
    );
  }

  private fetchOsrmRoute(
    start: { lat: number, lng: number },
    end: { lat: number, lng: number },
    transportMode: string
  ): Observable<any> {
    // OSRM driving route API with alternatives (100% Free)
    const url = `http://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`;

    return this.http.get<any>(url).pipe(
      map(res => {
        if (res && res.code === 'Ok' && res.routes && res.routes.length > 0) {
          const route = res.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] // Swap to [lat, lng] for Leaflet
          );

          // Extract alternative routes coordinates if available
          const alternativeCoordinates: Array<Array<[number, number]>> = [];
          if (res.routes.length > 1) {
            for (let i = 1; i < res.routes.length; i++) {
              if (res.routes[i].geometry && res.routes[i].geometry.coordinates) {
                alternativeCoordinates.push(
                  res.routes[i].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
                );
              }
            }
          }

          this.displayRouteOnMap(coords, start, end, alternativeCoordinates);

          const distanceMeters = route.distance;
          const distanceKm = distanceMeters / 1000.0;
          let baseDurationMinutes: number;

          if (transportMode === 'walking') {
            baseDurationMinutes = Math.max(3, Math.round((distanceKm / 4.5) * 60));
          } else if (transportMode === 'transit') {
            baseDurationMinutes = Math.max(12, Math.round(8 + (distanceKm / 14.0) * 60));
          } else {
            // Driving in urban Moroccan environment
            if (distanceKm <= 5.0) {
              baseDurationMinutes = Math.max(5, Math.round((distanceKm / 19.0) * 60));
            } else if (distanceKm <= 15.0) {
              baseDurationMinutes = Math.round((distanceKm / 22.0) * 60);
            } else {
              baseDurationMinutes = Math.round(15 + ((distanceKm - 10) / 105.0) * 60);
            }
          }

          const hour = new Date().getHours();
          const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
          let trafficDelayMinutes = 0;
          if (transportMode === 'driving') {
            trafficDelayMinutes = isPeak ? Math.round(baseDurationMinutes * 0.70) : Math.round(baseDurationMinutes * 0.20);
          } else if (transportMode === 'transit') {
            trafficDelayMinutes = isPeak ? 6 : 2;
          }

          const durationSeconds = baseDurationMinutes * 60;
          const trafficDelaySeconds = trafficDelayMinutes * 60;

          return {
            distanceMeters,
            durationSeconds,
            trafficDelaySeconds,
            startCoords: start,
            endCoords: end,
            coordinates: coords,
            alternativeCoordinates,
            routes: [{
              legs: [{
                distance: { value: distanceMeters },
                duration: { value: durationSeconds },
                duration_in_traffic: { value: durationSeconds + trafficDelaySeconds },
                start_location: {
                  lat: () => start.lat,
                  lng: () => start.lng
                },
                end_location: {
                  lat: () => end.lat,
                  lng: () => end.lng
                }
              }]
            }]
          };
        }
        return null;
      }),
      catchError(err => {
        console.warn('OSRM request error, generating fallback straight line:', err);
        const coords: [number, number][] = [[start.lat, start.lng], [end.lat, end.lng]];
        this.displayRouteOnMap(coords, start, end);

        // Approximate distance
        const d = this.calculateDistance(start.lat, start.lng, end.lat, end.lng) * 1000;
        const dur = (d / 1000 / 45) * 3600;

        return of({
          distanceMeters: d,
          durationSeconds: dur,
          trafficDelaySeconds: 300,
          startCoords: start,
          endCoords: end,
          coordinates: coords,
          routes: [{
            legs: [{
              distance: { value: d },
              duration: { value: dur },
              duration_in_traffic: { value: dur + 300 },
              start_location: {
                lat: () => start.lat,
                lng: () => start.lng
              },
              end_location: {
                lat: () => end.lat,
                lng: () => end.lng
              }
            }]
          }]
        });
      })
    );
  }

  private displayRouteOnMap(
    latLngs: [number, number][],
    start: { lat: number, lng: number },
    end: { lat: number, lng: number },
    alternativeRoutes?: Array<Array<[number, number]>>
  ): void {
    if (!this.map) return;

    // Clear previous elements
    this.clearRouteLayers();

    // Draw alternative routes in background (semi-transparent grey/slate)
    if (alternativeRoutes && alternativeRoutes.length > 0) {
      alternativeRoutes.forEach((altCoords) => {
        const altLine = L.polyline(altCoords, {
          color: '#94a3b8',
          weight: 4,
          opacity: 0.6,
          dashArray: '6, 6'
        }).addTo(this.map);
        this.alternativePolylines.push(altLine);
      });
    }

    // Draw active main route polyline
    this.currentPolyline = L.polyline(latLngs, {
      color: '#2563eb',
      weight: 6,
      opacity: 0.9
    }).addTo(this.map);

    // Custom circle markers for start and end
    this.startMarker = L.circleMarker([start.lat, start.lng], {
      radius: 9,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1
    }).addTo(this.map).bindPopup('<b>Point de départ</b>');

    this.endMarker = L.circleMarker([end.lat, end.lng], {
      radius: 9,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1
    }).addTo(this.map).bindPopup('<b>Destination</b>');

    // Fit map bounds to show entire route
    this.map.fitBounds(this.currentPolyline.getBounds(), {
      padding: [40, 40]
    });
  }

  /**
   * Highlights a specific route when the user clicks an alternative card.
   */
  public highlightRoute(
    coordinates?: Array<[number, number]>,
    isTransit: boolean = false,
    transitDetails?: any
  ): void {
    if (!this.map || !coordinates || coordinates.length === 0) return;

    if (this.currentPolyline) {
      this.map.removeLayer(this.currentPolyline);
    }
    this.clearTransitMarkers();

    const color = isTransit ? '#ea580c' : '#2563eb';
    this.currentPolyline = L.polyline(coordinates, {
      color,
      weight: 6,
      opacity: 0.9,
      dashArray: isTransit ? '6, 6' : undefined
    }).addTo(this.map);

    // Place mid-way transit station marker if transit
    if (isTransit && transitDetails) {
      const midIdx = Math.floor(coordinates.length / 2);
      const midCoord = coordinates[midIdx];
      if (midCoord) {
        const marker = L.circleMarker(midCoord, {
          radius: 8,
          fillColor: '#ea580c',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(this.map).bindPopup(`<b>🚏 ${transitDetails.line}</b><br>${transitDetails.stopsCount} arrêts • ${transitDetails.fare}`);
        this.transitMarkers.push(marker);
      }
    }

    this.map.fitBounds(this.currentPolyline.getBounds(), { padding: [40, 40] });
  }

  private clearRouteLayers(): void {
    if (this.currentPolyline) {
      this.map.removeLayer(this.currentPolyline);
      this.currentPolyline = null;
    }
    this.alternativePolylines.forEach(line => this.map.removeLayer(line));
    this.alternativePolylines = [];
    this.clearTransitMarkers();
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null;
    }
  }

  private clearTransitMarkers(): void {
    this.transitMarkers.forEach(m => this.map.removeLayer(m));
    this.transitMarkers = [];
  }

  private geocode(address: string): Observable<{ lat: number, lng: number } | null> {
    if (!address || address.trim().length === 0) return of(null);
    address = address.trim();

    // 1. Direct coords check "lat,lng"
    const coordsMatch = address.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordsMatch) {
      return of({
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[3])
      });
    }

    // 2. Fast & 100% reliable Moroccan local database check first
    const key = address.toLowerCase();
    for (const [name, coords] of Object.entries(this.moroccanCoords)) {
      if (key.includes(name)) {
        return of(coords);
      }
    }

    // 3. Nominatim Geocoding restricted strictly to Morocco with Casablanca priority
    const query = (key.includes('maroc') || key.includes('morocco')) ? address : `${address}, Casablanca, Maroc`;
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&countrycodes=ma&format=json&limit=1`;

    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (results && results.length > 0) {
          return {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon)
          };
        }
        return this.getFallbackCoords(address);
      }),
      catchError(() => of(this.getFallbackCoords(address)))
    );
  }

  private getFallbackCoords(address: string): { lat: number, lng: number } {
    const key = address.toLowerCase();
    for (const [name, coords] of Object.entries(this.moroccanCoords)) {
      if (key.includes(name)) {
        return coords;
      }
    }
    return this.defaultCenter;
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (this.map) {
            if (this.userMarker) {
              this.map.removeLayer(this.userMarker);
            }
            this.userMarker = L.circleMarker([lat, lng], {
              radius: 8,
              fillColor: '#2563eb',
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 1
            }).addTo(this.map).bindPopup('<b>Votre position actuelle</b>');

            this.map.setView([lat, lng], 13);
          }
        },
        () => console.log('Geolocation unavailable or denied')
      );
    }
  }

  toggleTraffic(): void {
    this.showTraffic = !this.showTraffic;
  }

  updateWeather(lat: number, lng: number, cityName?: string): void {
    this.meteoService.getLiveWeather(lat, lng).subscribe({
      next: (data) => {
        this.weatherData = {
          city: cityName || 'Casablanca',
          temp: data.current.temperature,
          condition: data.current.condition
        };
      },
      error: (err: any) => console.error('Error fetching weather:', err)
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1.3;
  }
}
