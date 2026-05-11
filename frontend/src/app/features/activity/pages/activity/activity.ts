import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityLog, ActivityFilters} from '../../../../core/services/activity.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { MangaNavbarComponent } from '../../../../core/layouts/manga-navbar/manga-navbar';
import { SearchStateService } from '../../../../core/services/search-state.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, MangaNavbarComponent],
  templateUrl: './activity.html',
  styleUrls: ['./activity.css'],
})
export class ActivityComponent implements OnInit {
  private activityService = inject(ActivityService);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);
  private searchState = inject(SearchStateService);

  logs: ActivityLog[] = [];
  users: User[] = [];
  isLoading = true;
  loadError = '';
  clearSuccess = '';
  clearError = '';
  showClearModal = false;
  isClearing = false;

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalLogs = 0;
  readonly limit = 10;
  
  isSearch = false;
  // Filtros
  filters: ActivityFilters = {
    userId: '',
    role: '',
    action: '',
    from: '',
    to: '',
  };

  readonly roles = ['Admin', 'Editor', 'Viewer'];
  readonly actions = [
    { value: 'CREATE_MANGA', label: 'Creó manga' },
    { value: 'UPDATE_MANGA', label: 'Editó manga' },
    { value: 'DELETE_MANGA', label: 'Eliminó manga' },
    { value: 'VIEW_MANGA', label: 'Vio manga' },
    { value: 'CREATE_USER', label: 'Creó usuario' },
    { value: 'UPDATE_USER', label: 'Editó usuario' },
    { value: 'DELETE_USER', label: 'Eliminó usuario' },
    { value: 'LOGIN', label: 'Inició sesión' },
    { value: 'LOGOUT', label: 'Cerró sesión' },
    { value: 'UPDATE_PROFILE', label: 'Actualizó perfil' },
  ];

  ngOnInit(): void {
    this.searchState.resetSearch();

    this.searchState.isSearch$.subscribe(state => {
      this.isSearch = state;
    });
    
    this.loadUsers();
    this.loadLogs();
  }

  private loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: () => {},
    });
  }

  loadLogs(): void {
    this.isLoading = true;
    this.loadError = '';

    const activeFilters: ActivityFilters = { page: this.currentPage, limit: this.limit };
    if (this.filters.userId) activeFilters.userId = this.filters.userId;
    if (this.filters.role) activeFilters.role = this.filters.role;
    if (this.filters.action) activeFilters.action = this.filters.action;
    if (this.filters.from) activeFilters.from = this.filters.from;
    if (this.filters.to) activeFilters.to = this.filters.to;

    this.activityService.getLogs(activeFilters).subscribe({
      next: (res) => {
        this.logs = res.logs;
        this.totalPages = res.pages;
        this.totalLogs = res.total;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = 'No se pudo cargar el historial.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.filters = { userId: '', role: '', action: '', from: '', to: '' };
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadLogs();
  }

  openClearModal(): void {
    this.showClearModal = true;
    this.clearError = '';
    this.clearSuccess = '';
  }

  closeClearModal(): void {
    this.showClearModal = false;
  }

  confirmClear(): void {
    if (this.isClearing) return;
    this.isClearing = true;
    this.clearError = '';

    this.activityService.clearLogs().subscribe({
      next: (res) => {
        this.clearSuccess = res.message;
        this.isClearing = false;
        this.showClearModal = false;
        this.currentPage = 1;
        this.loadLogs();
        this.cdr.markForCheck();
        setTimeout(() => {
          this.clearSuccess = '';
          this.cdr.markForCheck();
        }, 4000);
      },
      error: () => {
        this.clearError = 'No se pudo limpiar el historial.';
        this.isClearing = false;
        this.cdr.markForCheck();
      },
    });
  }

  getActionClass(action: string): string {
    if (action.includes('DELETE')) return 'badge-delete';
    if (action.includes('CREATE')) return 'badge-create';
    if (action.includes('UPDATE') || action.includes('PROFILE')) return 'badge-update';
    if (action === 'VIEW_MANGA') return 'badge-view';
    if (action === 'LOGIN') return 'badge-login';
    if (action === 'LOGOUT') return 'badge-logout';
    return 'badge-default';
  }

  getRoleClass(role: string): string {
    if (role === 'Admin') return 'role-admin';
    if (role === 'Editor') return 'role-editor';
    return 'role-viewer';
  }

  getEntityIcon(entity: string): string {
    if (entity === 'manga') return 'bi-book-half';
    if (entity === 'user') return 'bi-person-fill';
    if (entity === 'session') return 'bi-shield-lock';
    return 'bi-pencil-square';
  }

  get pages(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
