import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-overlay">
      <nav class="navbar">
        <div class="logo">
          <span class="icon">🚗</span> SmartMove
        </div>
        <div class="nav-links">
          <a routerLink="/login" class="btn btn-outline">Connexion</a>
          <a routerLink="/register" class="btn btn-primary">Inscription</a>
        </div>
      </nav>

      <main class="hero">
        <div class="hero-content animate-fade-in">
          <h1>Bienvenue sur votre <br> <span class="gradient-text">Plateforme de Mobilité</span></h1>
          <p class="subtitle">
            Gérez le trafic, surveillez les incidents et optimisez vos déplacements. 
            Une solution intelligente pour une ville connectée.
          </p>
          <div class="cta-buttons">
            <a routerLink="/register" class="cta-primary">Commencer maintenant</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
                  url('https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      color: white;
      font-family: 'Inter', -apple-system, sans-serif;
      overflow-x: hidden;
    }

    .landing-overlay {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 0 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Navbar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30px 0;
      z-index: 100;
    }

    .logo {
      font-size: 28px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 12px;
      letter-spacing: -1px;
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .btn {
      padding: 12px 28px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 15px;
    }

    .btn-outline {
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
    }
    .btn-outline:hover {
      background: white;
      color: black;
      border-color: white;
    }

    .btn-primary {
      background: white;
      color: #0f172a;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      background: #f1f5f9;
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }

    /* Hero */
    .hero {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-bottom: 80px;
    }

    .hero-content {
      max-width: 900px;
      padding: 40px;
      border-radius: 32px;
      /* Optional: add a subtle dark backing for better text readability */
      /* background: rgba(0,0,0,0.2); 
      backdrop-filter: blur(5px); */
    }

    h1 {
      font-size: clamp(48px, 8vw, 84px);
      line-height: 1;
      font-weight: 900;
      margin-bottom: 32px;
      letter-spacing: -3px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
    }

    .subtitle {
      font-size: 22px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin-bottom: 50px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      font-weight: 500;
    }

    .cta-buttons {
      display: flex;
      gap: 24px;
      justify-content: center;
    }

    .cta-primary {
      background: #3b82f6;
      color: white;
      padding: 20px 48px;
      border-radius: 16px;
      text-decoration: none;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.6);
      transition: all 0.3s;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .cta-primary:hover {
      transform: translateY(-5px) scale(1.02);
      background: #2563eb;
      box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.7);
    }

    .animate-fade-in {
      animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media(max-width: 768px) {
      .landing-overlay { padding: 0 20px; }
      h1 { font-size: 48px; }
      .subtitle { font-size: 18px; }
      .navbar { flex-direction: column; gap: 24px; }
      .cta-primary { padding: 18px 36px; width: 100%; text-align: center; }
    }
  `]
})
export class LandingComponent { }
