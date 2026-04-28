import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { MangaService, Manga } from '../../core/services/manga.service';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';
import { MangaNavbarComponent } from "../../core/components/manga-navbar/manga-navbar";

@Component({
  selector: 'app-manga-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MangaNavbarComponent
],
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

  ngOnInit(): void {

    const user = this.authService.getUser();
    this.userRole = user?.role || null;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadMangas();
    });
    
    this.loadMangas();
  }
 
  loadMangas(): void {
    this.mangaService.getMangas().subscribe({
      next: (data) => {
        this.mangas = [...data];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando mangas', err);
      }
    });
  }

  deleteManga(manga: Manga): void {
    this.mangaToDelete = manga;
  }

  cancelDelete(): void {
    this.mangaToDelete = null;
  }

  confirmDelete(): void {
    if (!this.mangaToDelete || this.isDeleting) return;

    const idToDelete = this.mangaToDelete._id!;
    this.isDeleting = true;

    this.mangaService.deleteManga(idToDelete).subscribe({
      next: () => {
        this.mangas = [...this.mangas.filter(m => m._id !== idToDelete)];
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

  canEdit(): boolean {
    return this.userRole === 'Admin' || this.userRole === 'Editor';
  }

  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  getStatusClass(status: string): string {

    if (status === 'emision') return 'status-emision';

    if (status === 'finalizado') return 'status-finalizado';

    return 'status-proximamente';

  }
}