import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="glow-1"></div>
      <div class="glow-2"></div>

      <div class="login-card animate-slide-up">
        <div class="logo">
          <span class="logo-icon">🚗</span>
          <h1>Inscription</h1>
          <p class="subtitle">Rejoignez SmartMove pour une ville plus fluide</p>
        </div>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>👤 Nom d'utilisateur</label>
            <input type="text" [(ngModel)]="user.username" name="username" required>
          </div>
          
          <div class="form-group">
            <label>📧 Email</label>
            <input type="email" [(ngModel)]="user.email" name="email" required>
          </div>
          
          <div class="form-group">
            <label>🔒 Mot de passe</label>
            <input type="password" [(ngModel)]="user.password" name="password" required>
          </div>

          <div class="form-group">
            <label>🔒 Confirmer Mot de passe</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required>
          </div>

          <div class="error-container" *ngIf="errorMessage">
            <span class="error-text">⚠️ {{ errorMessage }}</span>
          </div>

          <button type="submit" [disabled]="isLoading" class="login-btn">
            <span *ngIf="!isLoading">Créer mon compte</span>
            <span class="loader" *ngIf="isLoading"></span>
          </button>

          <div class="footer-link">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Reusing styles from Login for consistency */
    :host { display: block; height: 100vh; overflow: hidden; }
    .login-container { height: 100%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%); position: relative; }
    .login-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 32px; width: 100%; max-width: 440px; position: relative; z-index: 1; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-icon { font-size: 40px; display: block; margin-bottom: 10px; }
    h1 { margin: 0; color: white; font-size: 28px; font-weight: 800; }
    .subtitle { color: #94a3b8; font-size: 14px; margin-top: 5px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; }
    input { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(255, 255, 255, 0.05); border-radius: 12px; color: white; transition: all 0.3s; }
    input:focus { border-color: #3b82f6; outline: none; background: rgba(255, 255, 255, 0.08); }
    .login-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; margin-top: 10px; }
    .login-btn:disabled { opacity: 0.6; }
    .error-container { margin-bottom: 20px; color: #f87171; font-size: 13px; text-align: center; }
    .footer-link { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 14px; }
    .footer-link a { color: #3b82f6; text-decoration: none; font-weight: 600; }
    .glow-1, .glow-2 { position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%); z-index: 0; border-radius: 50%; }
    .glow-1 { top: -200px; left: -100px; }
    .glow-2 { bottom: -100px; right: -50px; background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%); }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RegisterComponent {
  user = { username: '', email: '', password: '' };
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.authService.register(this.user).subscribe({
      next: () => {
        alert('Inscription réussie ! Connectez-vous.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        // Handle both string errors (from backend) and object errors (parsing/network issues)
        if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          // If parsing failed (e.g. 200 OK treated as error), check if message is actually success
          if (err.status === 200) {
             // This fallback should rarely be hit if responseType is 'text', but good for safety
             alert('Inscription réussie ! Connectez-vous.');
             this.router.navigate(['/login']);
             return;
          }
          this.errorMessage = 'Erreur lors de l\'inscription';
        }
        this.isLoading = false;
      }
    });
  }
}
