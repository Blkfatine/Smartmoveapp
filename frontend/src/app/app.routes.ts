import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];
