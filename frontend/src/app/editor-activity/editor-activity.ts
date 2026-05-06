import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityLog, ActivityFilters } from '../core/services/activity.service';
import { MangaNavbarComponent } from '../core/components/manga-navbar/manga-navbar';

@Component({
  selector: 'app-editor-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, MangaNavbarComponent],
  templateUrl: './editor-activity.html',
  styleUrls: ['./editor-activity.css'],
})
export class EditorActivityComponent implements OnInit {
  private activityService = inject(ActivityService);
  private cdr = inject(ChangeDetectorRef);

  logs: ActivityLog[] = [];
  isLoading = true;
  loadError = '';

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalLogs = 0;
  readonly limit = 10;

  // Filtros disponibles para editores
  filters: ActivityFilters = {
    action: '',
    from: '',
    to: '',
  };

  readonly actions = [
    { value: 'CREATE_MANGA', label: 'Creó manga' },
    { value: 'UPDATE_MANGA', label: 'Editó manga' },
    { value: 'VIEW_MANGA', label: 'Vio manga' },
    { value: 'LOGIN', label: 'Inició sesión' },
    { value: 'LOGOUT', label: 'Cerró sesión' },
    { value: 'UPDATE_PROFILE', label: 'Actualizó perfil' },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.loadError = '';

    const activeFilters: ActivityFilters = { page: this.currentPage, limit: this.limit };
    if (this.filters.action) activeFilters.action = this.filters.action;
    if (this.filters.from) activeFilters.from = this.filters.from;
    if (this.filters.to) activeFilters.to = this.filters.to;

    this.activityService.getEditorLogs(activeFilters).subscribe({
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
    this.filters = { action: '', from: '', to: '' };
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadLogs();
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

  getEntityIcon(entity: string): string {
    if (entity === 'manga') return 'bi-book-half';
    if (entity === 'user') return 'bi-person-fill';
    if (entity === 'session') return 'bi-shield-lock';
    return 'bi-pencil-square';
  }

  isOtherEditor(log: ActivityLog): boolean {
    return log.userRole === 'Editor' && !!log.user;
  }

  get pages(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
