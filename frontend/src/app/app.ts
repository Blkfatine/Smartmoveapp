import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app-shell">
      <!-- Global Header - Only visible when logged in -->
      <header class="header-bar" *ngIf="authService.isLoggedIn()">
        <div class="logo" routerLink="/home" style="cursor: pointer">
          <span class="logo-icon">🚗</span>
          <span class="logo-text">SmartMove</span>
        </div>
        
        <div class="header-nav">
          <button class="nav-link" routerLink="/home" routerLinkActive="active">Accueil</button>
          <button class="nav-link" routerLink="/dashboard" routerLinkActive="active">Trajet</button>
          <button class="nav-link" routerLink="/notifications" routerLinkActive="active">Notifications</button>
        </div>

        <div class="header-info">
          <span class="user-greeting" *ngIf="username">👤 {{ username }}</span>
          <span class="status-badge">
            <span class="status-dot"></span>
            En Direct
          </span>
          <span class="time-display">{{ currentTime }}</span>
          <button class="logout-btn" (click)="logout()">Déconnexion</button>
        </div>
      </header>

      <!-- Main Router Content -->
      <main class="shell-content" [class.with-header]="authService.isLoggedIn()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: #1e3a5f;
      color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 22px; font-weight: 700; color: white; }

    .header-nav {
        display: flex;
        gap: 15px;
        margin: 0 40px;
    }

    .nav-link {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.7);
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
        text-decoration: none;
        font-size: 14px;
    }

    .nav-link:hover { color: white; background: rgba(255,255,255,0.1); }
    .nav-link.active { color: white; background: rgba(255,255,255,0.2); }

    .header-info { display: flex; align-items: center; gap: 16px; }
    .user-greeting { font-weight: 600; color: #cbd5e1; font-size: 14px; }

    .logout-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s;
    }
    .logout-btn:hover { background: rgba(255,255,255,0.25); }

    .status-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; background: rgba(255,255,255,0.15);
      border-radius: 20px; font-size: 13px;
    }

    .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    .time-display {
      font-size: 14px; font-weight: 500; padding: 6px 14px;
      background: rgba(255,255,255,0.1); border-radius: 8px;
    }

    .shell-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden; /* This is crucial to prevent the whole page from scrolling */
      background: #f0f4f8;
    }
  `]
})
export class App implements OnInit, OnDestroy {
  currentTime: string = '';
  username: string | null = null;
  private timeInterval: any;

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.updateTime();
        if (!this.username) this.username = this.authService.getUsername();
      }
    }, 1000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  logout() {
    this.username = null;
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }
}
