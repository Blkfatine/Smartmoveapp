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
  private apiUrl = 'http://localhost:8888/api/notifications';
  private eventSource: EventSource | null = null;

  // Mock data for WOW effect demonstration if backend is empty
  private mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Alerte Trafic : Casablanca',
      message: 'Ralentissement majeur détecté sur l\'autoroute urbaine vers Casa-Port. Privilégiez le trajet alternatif via Boulevard Zerktouni.',
      type: 'TRAFFIC',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Météo : Vigilance Pluie',
      message: 'Fortes précipitations attendues entre 18h et 20h. La visibilité sera réduite, adaptez votre vitesse.',
      type: 'WEATHER',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      title: 'Incident Signalé',
      message: 'Panne de signalisation au carrefour Ghandi. Prudence lors de la traversée.',
      type: 'INCIDENT',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchNotifications();
    this.connectToStream();
  }

  fetchNotifications() {
    this.http.get<Notification[]>(this.apiUrl).pipe(
      catchError(err => {
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

    this.eventSource.onmessage = (event) => {
      console.log('New notification received:', event.data);
      try {
        const newNotif: Notification = JSON.parse(event.data);
        // Prepend to list for real-time effect
        this.notifications = [newNotif, ...this.notifications];
      } catch (e) {
        console.error('Failed to parse SSE event', e);
      }
    };

    this.eventSource.onerror = (error) => {
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
