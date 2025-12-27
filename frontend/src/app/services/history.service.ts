import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = 'http://localhost:8080/prediction-service/api/history'; // Assuming Gateway entry

  constructor(private http: HttpClient) {}

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addToHistory(route: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, route);
  }

  deleteFromHistory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  toggleTracking(id: number, enabled: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/track?enabled=${enabled}`, {});
  }
}
