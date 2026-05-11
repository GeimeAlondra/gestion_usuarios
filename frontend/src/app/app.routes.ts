import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, editorGuard, noAuthGuard } from './core/guards/auth.guard'; 
import { LoginComponent } from './features/auth/pages/login/login';
import { ProfileComponent } from './features/auth/pages/profile/profile';
import { RegisterComponent } from './features/auth/pages/register/register';
import { DashboardComponent } from './features/dashboard/pages/dashboard';
import { UsuariosComponent } from './features/usuarios/pages/usuarios/usuarios';
import { CrearUsuarioComponent } from './features/usuarios/pages/crear-usuario/crear-usuario';
import { MangaListComponent } from './features/mangas/pages/manga-list/manga-list';
import { MangaFormComponent } from './features/mangas/pages/manga-form/manga-form';
import { MangaDetailComponent } from './features/mangas/pages/manga-detail/manga-detail';
import { ActivityComponent } from './features/activity/pages/activity/activity';
import { EditorActivityComponent } from './features/activity/pages/editor-activity/editor-activity';

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
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'actividad', component: ActivityComponent, canActivate: [adminGuard] },
  { path: 'editor/actividad', component: EditorActivityComponent, canActivate: [editorGuard] }, // ← NUEVO
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];