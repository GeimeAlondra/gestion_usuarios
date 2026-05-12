import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MangaService, Manga } from '../../../../core/services/manga.service';
import { AuthService } from '../../../../core/services/auth.service';
import { filter } from 'rxjs';
import { MangaNavbarComponent } from '../../../../core/layouts/manga-navbar/manga-navbar';
import { FormsModule } from '@angular/forms';
import { SearchStateService } from '../../../../core/services/search-state.service';

@Component({
  selector: 'app-manga-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MangaNavbarComponent],
  templateUrl: './manga-list.html',
  styleUrls: ['./manga-list.css']
})
export class MangaListComponent implements OnInit {
  private mangaService = inject(MangaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private searchState = inject(SearchStateService);
  
  mangaToDelete: Manga | null = null;
  isDeleting = false;

  isLoading = true;

  mangas: Manga[] = [];
  userRole: string | null = null;

  favoriteIds = new Set<string>();
  showOnlyFavorites = false;

  isSearch = false;
  // FILTROS
  filters = {
    search: '',
    status: '',
    genre: '',
  };

  readonly statuses = [
    'emision',
    'finalizado',
    'proximamente'
  ];

  genres: string[] = [];

  // PAGINACIÓN
  currentPage = 1;
  pageSize = 4;

  get filteredMangas(): Manga[] {
    let filtered = [...this.mangas];

    if (this.showOnlyFavorites) {
      filtered = filtered.filter(m => this.favoriteIds.has(m._id!));
    }

    if (this.filters.search.trim()) {
      const text = this.filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(text)
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter(m => m.status === this.filters.status);
    }

    if (this.filters.genre) {
      filtered = filtered.filter(m =>
        m.genres.some(g => g.name === this.filters.genre)
      );
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMangas.length / this.pageSize);
  }

  get displayedMangas(): Manga[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMangas.slice(start, start + this.pageSize);
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

  ngOnInit(): void {
    this.searchState.resetSearch();
    const user = this.authService.getUser();
    this.userRole = user?.role || null;

    this.searchState.isSearch$.subscribe(state => {
      this.isSearch = state;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.loadMangas());

    this.loadMangas();

    if (this.userRole === 'Viewer') {
      this.loadFavorites();
    } 
  }

  loadMangas(): void {
    this.isLoading = true;
    this.mangaService.getMangas().subscribe({
      next: (data) => {
        this.mangas = [...data];
        this.extractGenres();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando mangas', err)
    });
  }

  loadFavorites(): void {
    this.mangaService.getFavorites().subscribe({
      next: (favs) => {
        this.favoriteIds = new Set(favs.map(f => f._id!));
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  extractGenres(): void {
    const allGenres = this.mangas.flatMap(m =>
      m.genres.map(g => g.name)
    );

    this.genres = [...new Set(allGenres)].sort();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      status: '',
      genre: '',
    };
    this.resetPage();
  }

  toggleFavorite(manga: Manga, event: Event): void {
    event.stopPropagation();
    this.mangaService.toggleFavorite(manga._id!).subscribe({
      next: ({ isFavorite }) => {
        if (isFavorite) {
          this.favoriteIds.add(manga._id!);
        } else {
          this.favoriteIds.delete(manga._id!);
        }
        this.favoriteIds = new Set(this.favoriteIds);
        this.cdr.markForCheck();
      }
    });
  }

  isFavorite(manga: Manga): boolean {
    return this.favoriteIds.has(manga._id!);
  }

  deleteManga(manga: Manga): void { this.mangaToDelete = manga; }
  cancelDelete(): void { this.mangaToDelete = null; }

  confirmDelete(): void {
    if (!this.mangaToDelete || this.isDeleting) return;
    const idToDelete = this.mangaToDelete._id!;
    this.isDeleting = true;

    this.mangaService.deleteManga(idToDelete).subscribe({
      next: () => {
        this.mangas = [...this.mangas.filter(m => m._id !== idToDelete)];
        this.favoriteIds.delete(idToDelete); 
        this.mangaToDelete = null;
        this.isDeleting = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isDeleting = false;
        this.mangaToDelete = null;
        alert('Error al eliminar');
        this.cdr.markForCheck();
      }
    });
  }

  canEdit(): boolean { return this.userRole === 'Admin' || this.userRole === 'Editor'; }
  isAdmin(): boolean { return this.userRole === 'Admin'; }

  getStatusClass(status: string): string {
    if (status === 'emision') return 'status-emision';
    if (status === 'finalizado') return 'status-finalizado';
    return 'status-proximamente';
  }
}