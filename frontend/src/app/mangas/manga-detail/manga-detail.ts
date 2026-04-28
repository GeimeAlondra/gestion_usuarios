import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MangaService, Manga } from '../../core/services/manga.service';
import { MangaNavbarComponent } from "../../core/components/manga-navbar/manga-navbar";

@Component({
  selector: 'app-manga-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MangaNavbarComponent
],
  templateUrl: './manga-detail.html',
  styleUrls: ['./manga-detail.css']
})
export class MangaDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private mangaService = inject(MangaService);
  private cdr = inject(ChangeDetectorRef);

  manga: Manga | null = null;

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMangaDetail(id);
      }
    });
  }

  private loadMangaDetail(id: string): void {
    this.mangaService.getManga(id).subscribe({
      next: (data) => {
        this.manga = { ...data };
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando manga', err);
        this.cdr.markForCheck();
      }
    });
  }

  getStatusClass(status: string): string {

    if (status === 'emision')
      return 'status-emision';

    if (status === 'finalizado')
      return 'status-finalizado';

    return 'status-proximamente';

  }
}