export interface Advice {
  title: string;
  text: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

export interface TransitStep {
  type: 'walk' | 'bus' | 'tram';
  line?: string;           // ex: 'Bus Ligne 9', 'Tramway T1'
  lineColor?: string;      // ex: '#2563eb', '#16a34a', '#dc2626'
  instruction: string;     // ex: 'Prendre le Bus Ligne 9 à l'arrêt Bd Roudani'
  stopCount?: number;      // ex: 12 arrêts
  durationMinutes: number; // ex: 22 min
  departureStop?: string;  // ex: 'Arrêt Roudani - Hôpital'
  arrivalStop?: string;    // ex: 'Gare Casa Port'
}

export interface TransitDetails {
  line: string;            // ex: 'Casabus Ligne 9'
  lineType: 'bus' | 'tram';
  operator: string;        // ex: 'Alsa Al Baida (Casabus)' ou 'RATP Dev Casablanca'
  fare: string;            // ex: '5.00 MAD'
  frequency: string;       // ex: 'Toutes les 8-10 min'
  departureStop: string;   // ex: 'Bd Roudani - Maarif'
  arrivalStop: string;     // ex: 'Gare Casa Port'
  stopsCount: number;      // ex: 14 arrêts
  walkTimeToStop: number;  // ex: 4 min
  walkTimeFromStop: number;// ex: 2 min
  steps: TransitStep[];
}

export interface RouteOptionUI {
  id: string;
  title: string;             // ex: 'Itinéraire 1 : Via Bd Zerktouni (Direct)'
  summary: string;           // ex: 'Axe central le plus court'
  badge: string;             // ex: 'Recommandé', 'Plus rapide', 'Transport en commun'
  badgeType: 'primary' | 'success' | 'warning' | 'info';
  mode: 'driving' | 'transit' | 'walking';
  distanceKm: number;
  durationMinutes: number;
  trafficDelayMinutes: number;
  trafficLevel: 'FLUID' | 'MODERATE' | 'HEAVY';
  arrivalTime: string;
  diffMinutes?: number;      // Ecart par rapport à l'option principale (+2 min, -3 min, etc.)
  transitLine?: string;      // ex: 'Casabus Ligne 9' ou 'Tramway T1'
  transitDetails?: TransitDetails;
  coordinates?: Array<[number, number]>; // Coordonnées pour tracer sur la carte Leaflet
  selected?: boolean;
}

export interface PredictionUIModel {
  // Core Trip Data
  mode: 'driving' | 'transit' | 'walking';
  distanceKm: number;
  durationMinutes: number;
  arrivalTime: string;
  
  // Traffic / Impact
  trafficDelayMinutes: number | null; // Null if not driving/data missing
  trafficLevel: 'FLUID' | 'MODERATE' | 'HEAVY' | 'UNKNOWN';
  
  // Weather Impact
  weatherSummary: string;
  weatherImpactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Risk & Confidence
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0-100
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // SmartMove Advice
  advice: Advice;
  
  // Data Availability Flags
  dataStatus: {
    hasTraffic: boolean;
    hasWeather: boolean;
    hasIncidents: boolean;
  };

  // Weather Raw (for display if needed)
  currentTemp?: number;
  weatherCondition?: string;

  // Multi-route Alternatives & Public Transit (Casabus / Tram)
  routeOptions?: RouteOptionUI[];
  selectedRouteId?: string;
  transitDetails?: TransitDetails;
}
