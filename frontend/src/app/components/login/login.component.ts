import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <!-- Ambient Glows -->
      <div class="glow-1"></div>
      <div class="glow-2"></div>

      <div class="login-card animate-slide-up">
        <div class="logo">
          <span class="logo-icon">🚗</span>
          <h1>SmartMove</h1>
          <p class="subtitle">Votre assistant intelligent de mobilité en temps réel</p>
        </div>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>
              <span class="label-icon">👤</span> Utilisateur
            </label>
            <div class="input-wrapper">
              <input type="text" [(ngModel)]="username" name="username" placeholder="admin" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>
              <span class="label-icon">🔒</span> Mot de passe
            </label>
            <div class="input-wrapper">
              <input type="password" [(ngModel)]="password" name="password" placeholder="admin" required>
            </div>
          </div>

          <div class="error-container" *ngIf="errorMessage">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ errorMessage }}</span>
          </div>

          <button type="submit" [disabled]="isLoading" class="login-btn">
            <span class="btn-text" *ngIf="!isLoading">Accéder au tableau de bord</span>
            <span class="loader" *ngIf="isLoading"></span>
          </button>

          <div class="live-indicator">
            <span class="pulse-dot"></span>
            <span class="live-text">🟢 En direct • Données trafic & météo actualisées</span>
          </div>
        </form>

          <div class="footer-links" style="text-align: center; margin-top: 24px; font-size: 14px; color: #94a3b8;">
             Pas encore de compte ? <a routerLink="/register" style="color: #3b82f6; text-decoration: none; font-weight: 600;">S'inscrire</a>
          </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .login-container {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
      position: relative;
      overflow: hidden;
    }

    /* Ambient Glows */
    .glow-1 {
      position: absolute;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      top: -200px; left: -100px;
      z-index: 0;
    }

    .glow-2 {
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
      bottom: -100px; right: -50px;
      z-index: 0;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 48px;
      border-radius: 32px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 1;
    }

    .logo {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
      filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
    }

    h1 {
      margin: 0;
      color: white;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 8px;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .label-icon { font-size: 14px; }

    .input-wrapper {
      position: relative;
    }

    input {
      width: 100%;
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      font-size: 16px;
      color: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    input:focus {
      border-color: #3b82f6;
      background: rgba(255, 255, 255, 0.08);
      outline: none;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }

    input::placeholder {
      color: #475569;
    }

    .login-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.6);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-container {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      margin-bottom: 24px;
    }

    .error-icon { font-size: 16px; }
    .error-text { color: #f87171; font-size: 13px; font-weight: 500; }

    .live-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }

    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Animations */
    .animate-slide-up {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .login-card { padding: 32px 24px; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          this.errorMessage = 'Identifiants incorrects';
        } else if (err.status === 0) {
          this.errorMessage = 'Serveur inaccessible (Vérifiez Gateway)';
        } else {
          this.errorMessage = `Erreur système (${err.status})`;
        }
        this.isLoading = false;
      }
    });
  }
}
