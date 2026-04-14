import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { CrearUsuarioComponent } from './usuarios/crear-usuario/crear-usuario';
import { adminGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'usuarios/crear', component: CrearUsuarioComponent, canActivate: [adminGuard] },
  { path: 'usuarios/editar/:id', component: CrearUsuarioComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];