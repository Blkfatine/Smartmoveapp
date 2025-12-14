import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, map } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Prediction {
    origin: string;
    destination: string;
    predictedDuration: number;
    riskLevel: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class PredictionService {
    private apiUrl = 'http://localhost:8085/api/notifications/stream'; // Notification Service Direct URL (Port 8085 from application.yml)

    constructor(private http: HttpClient, private ngZone: NgZone) { }

    getPredictions(): Observable<Prediction[]> {
        return new Observable<Prediction[]>(observer => {
            const eventSource = new EventSource(this.apiUrl);

            eventSource.onmessage = (event) => {
                this.ngZone.run(() => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received SSE:', data);
                        // Wrap single prediction in array for now as map expects array
                        observer.next([data]);
                    } catch (e) {
                        console.error('Error parsing SSE data', e);
                    }
                });
            };

            eventSource.onerror = (error) => {
                this.ngZone.run(() => {
                    console.error('EventSource error:', error);
                    // Don't error out stream, just log retry
                    // eventSource.close(); 
                });
            };

            return () => {
                eventSource.close();
            };
        });
    }
}
