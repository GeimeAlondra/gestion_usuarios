import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MangaService, Manga } from '../../core/services/manga.service';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';
import { MangaNavbarComponent } from '../../core/components/manga-navbar/manga-navbar';

@Component({
  selector: 'app-manga-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MangaNavbarComponent],
  templateUrl: './manga-list.html',
  styleUrls: ['./manga-list.css']
})
export class MangaListComponent implements OnInit {
  private mangaService = inject(MangaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  mangaToDelete: Manga | null = null;
  isDeleting = false;

  mangas: Manga[] = [];
  userRole: string | null = null;

  favoriteIds = new Set<string>();
  showOnlyFavorites = false;

  get displayedMangas(): Manga[] {
    if (!this.showOnlyFavorites) return this.mangas;
    return this.mangas.filter(m => this.favoriteIds.has(m._id!));
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userRole = user?.role || null;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.loadMangas());

    this.loadMangas();
    this.loadFavorites(); 
  }

  loadMangas(): void {
    this.mangaService.getMangas().subscribe({
      next: (data) => {
        this.mangas = [...data];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando mangas', err)
    });
  }

  loadFavorites(): void {
    this.mangaService.getFavorites().subscribe({
      next: (favs) => {
        this.favoriteIds = new Set(favs.map(f => f._id!));
        this.cdr.markForCheck();
      }
    });
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