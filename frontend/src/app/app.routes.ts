import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { CrearUsuarioComponent } from './usuarios/crear-usuario/crear-usuario';
import { MangaListComponent } from './mangas/manga-list/manga-list';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, noAuthGuard } from './core/guards/auth.guard';
import { MangaFormComponent } from './mangas/manga-form/manga-form';
import { MangaDetailComponent } from './mangas/manga-detail/manga-detail';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'usuarios/crear', component: CrearUsuarioComponent, canActivate: [adminGuard] },
  { path: 'mangas', component: MangaListComponent, canActivate: [authGuard] },
  { path: 'usuarios/editar/:id', component: CrearUsuarioComponent, canActivate: [adminGuard] },
  { path: 'mangas/crear', component: MangaFormComponent, canActivate: [authGuard] },
  { path: 'mangas/editar/:id', component: MangaFormComponent, canActivate: [authGuard] },
  { path: 'mangas/:id', component: MangaDetailComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];