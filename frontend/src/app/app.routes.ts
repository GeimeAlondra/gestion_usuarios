import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];