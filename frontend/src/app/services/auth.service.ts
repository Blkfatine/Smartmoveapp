import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8888/auth'; // Via Gateway

    constructor(private http: HttpClient, private router: Router) { }

    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    login(credentials: { username: string, password: string }): Observable<any> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('username', credentials.username);
                })
            );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.router.navigate(['/']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }
}
