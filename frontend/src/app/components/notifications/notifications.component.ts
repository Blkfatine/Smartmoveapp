import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'TRAFFIC' | 'WEATHER' | 'INCIDENT';
  timestamp: string;
  details?: {
    mapUrl?: string;
    suggestion?: string;
    metrics?: string[];
  };
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  selectedNotification: Notification | null = null;
  showModal: boolean = false;

  private apiUrl = 'http://localhost:8888/api/notifications';
  private eventSource: EventSource | null = null;

  // Mock data for WOW effect demonstration if backend is empty
  private mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Alerte Trafic : Casablanca',
      message: 'Ralentissement majeur détecté sur l\'autoroute urbaine vers Casa-Port.',
      type: 'TRAFFIC',
      timestamp: new Date().toISOString(),
      details: {
        mapUrl: 'https://images.unsplash.com/photo-1506012733851-bb0755ee3852?q=80&w=400',
        suggestion: 'L\'IA suggère de passer par Boulevard Zerktouni pour gagner 15 minutes.',
        metrics: ['Densité: 85%', 'Vitesse moy: 12 km/h', 'Retard: 18 min']
      }
    },
    {
      id: 2,
      title: 'Météo : Vigilance Pluie',
      message: 'Fortes précipitations attendues entre 18h et 20h.',
      type: 'WEATHER',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: {
        mapUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=400',
        suggestion: 'Visibilité réduite à 200m. Rangez vos vélos et privilégiez le train.',
        metrics: ['Précipitations: 15mm/h', 'Vent: 45 km/h', 'Visibilité: Faible']
      }
    },
    {
      id: 3,
      title: 'Incident Signalé',
      message: 'Panne de signalisation au carrefour Ghandi.',
      type: 'INCIDENT',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: {
        mapUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400',
        suggestion: 'Intersection bloquée. Empruntez la rue Oued Zem pour contourner le secteur.',
        metrics: ['Gravité: Alta', 'Intervention en cours: Oui', 'Bloquage: 100%']
      }
    }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchNotifications();
    this.connectToStream();
  }

  openDetails(n: Notification) {
    this.selectedNotification = n;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedNotification = null;
  }

  fetchNotifications() {
    this.http.get<Notification[]>(this.apiUrl).pipe(
      catchError((err: any) => {
        console.error('Error fetching notifications, using fallback mock', err);
        return of(this.mockNotifications);
      })
    ).subscribe(data => {
      // If backend returns empty list, show mock for demo
      this.notifications = data && data.length > 0 ? data : this.mockNotifications;
    });
  }

  connectToStream() {
    console.log('Connecting to Notification Stream...');
    this.eventSource = new EventSource(`${this.apiUrl}/stream`);

    this.eventSource.onmessage = (event: any) => {
      console.log('New notification received:', event.data);
      try {
        const newNotif: Notification = JSON.parse(event.data);
        // Prepend to list for real-time effect
        this.notifications = [newNotif, ...this.notifications];
      } catch (e) {
        console.error('Failed to parse SSE event', e);
      }
    };

    this.eventSource.onerror = (error: any) => {
      console.error('SSE Error:', error);
      this.eventSource?.close();
      // Optional: Retry logic could be added here
    };

    this.eventSource.addEventListener('connect', (e: any) => {
      console.log('SSE Stream Connected:', e.data);
    });
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
