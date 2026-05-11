import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchStateService } from '../../services/search-state.service';

@Component({
  selector: 'app-manga-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manga-navbar.html',
  styleUrls: ['./manga-navbar.css'],
})
export class MangaNavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private searchState = inject(SearchStateService);

  user = this.authService.getUser();

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  toggleSearch() {
    this.searchState.toggleSearch();
  }
  
  isAdmin(): boolean {
    return this.user?.role === 'Admin';
  }

  isEditor(): boolean {
    return this.user?.role === 'Editor';
  }

  isViewer(): boolean {
    return this.user?.role === 'Viewer';
  }
}
