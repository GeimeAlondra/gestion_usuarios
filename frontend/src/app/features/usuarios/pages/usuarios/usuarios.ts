import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UsersService, User } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { filter } from 'rxjs';
import { MangaNavbarComponent } from "../../../../core/layouts/manga-navbar/manga-navbar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchStateService } from '../../../../core/services/search-state.service';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    LowerCasePipe,
    RouterLink,
    MangaNavbarComponent
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private searchState = inject(SearchStateService);

  users: User[] = [];
  filteredUsers: User[] = [];

  isLoading = true;
  loadError = '';

  userToDelete: User | null = null;
  isDeleting = false;
  deleteError = '';
  deleteSuccess = '';

  isSearch = false;
  // FILTROS
  filters = {
    search: '',
    role: '',
    status: '',
  };

  readonly roles = ['Admin', 'Editor', 'Viewer'];

  // PAGINACIÓN
  currentPage = 1;
  pageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  get currentUserId(): string {
    return this.authService.getUser()?.id ?? '';
  }

  ngOnInit(): void {
    this.searchState.resetSearch();
    this.searchState.isSearch$.subscribe(state => {
      this.isSearch = state;
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadUsers();
    });

    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.loadError = '';

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data.filter(u => u._id !== this.currentUserId);
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.filters.search.trim()) {
      const text = this.filters.search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(text) ||
        u.email.toLowerCase().includes(text)
      );
    }

    if (this.filters.role) {
      filtered = filtered.filter(u => u.role === this.filters.role);
    }

    if (this.filters.status) {
      const isActive = this.filters.status === 'active';
      filtered = filtered.filter(u => u.isActive === isActive);
    }

    this.filteredUsers = filtered;
    this.resetPage();
  }

  resetFilters(): void {
    this.filters = { search: '', role: '', status: '' };
    this.applyFilters();
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.deleteError = '';
    this.deleteSuccess = '';
  }

  cancelDelete(): void {
    this.userToDelete = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.userToDelete || this.isDeleting) return;

    const idToDelete = this.userToDelete._id;
    const nameToDelete = this.userToDelete.name;

    this.isDeleting = true;
    this.deleteError = '';

    this.usersService.deleteUser(idToDelete).subscribe({
      next: () => {
        this.users = [...this.users.filter((u) => u._id !== idToDelete)];
        this.applyFilters();
        this.userToDelete = null;
        this.isDeleting = false;
        this.deleteSuccess = `El usuario "${nameToDelete}" fue eliminado correctamente.`;
        this.cdr.markForCheck();

        setTimeout(() => {
          this.deleteSuccess = '';
          this.cdr.markForCheck();
        }, 4000);
      },
      error: (err) => {
        this.deleteError = err?.error?.message ?? 'No se pudo eliminar el usuario. Intenta de nuevo.';
        this.isDeleting = false;
        this.cdr.markForCheck();
      },
    });
  }
}