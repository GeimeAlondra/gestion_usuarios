import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MangaService, Manga } from '../../core/services/manga.service';
import { MangaNavbarComponent } from "../../core/components/manga-navbar/manga-navbar";

@Component({
  selector: 'app-manga-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MangaNavbarComponent,
    RouterLink
],
  templateUrl: './manga-form.html',
  styleUrls: ['./manga-form.css']
})

export class MangaFormComponent implements OnInit {

  form!: FormGroup;

  isEditMode = false;
  mangaId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private mangaService: MangaService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['emision', Validators.required],
      genre: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2026)]],
      chapters: [0, [Validators.required, Validators.min(0)]],
      author: ['', Validators.required],
      synopsis: ['', [Validators.maxLength(1000)]],
      coverUrl: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit(): void {
    this.mangaId = this.route.snapshot.paramMap.get('id');

    if (this.mangaId) {
      this.isEditMode = true;

      this.mangaService.getManga(this.mangaId)
        .subscribe(manga => {
          this.form.patchValue(manga);
        });
    }
  }

  save(): void {
    if (this.form.invalid) return;

    /* Convertir valores manualmente */
    const data: Manga = {
      title: this.form.value.title || '',
      status: this.form.value.status || 'emision',
      genre: this.form.value.genre || '',
      year: Number(this.form.value.year) || new Date().getFullYear(),
      chapters: Number(this.form.value.chapters) || 0,
      author: this.form.value.author || '',
      synopsis: this.form.value.synopsis || '',
      coverUrl: this.form.value.coverUrl || ''
    };

    if (this.isEditMode && this.mangaId) {
      this.mangaService.updateManga(this.mangaId, data)
        .subscribe(() => {
          this.router.navigate(['/mangas']);
        });
    } else {
      this.mangaService.createManga(data)
        .subscribe(() => {
          this.router.navigate(['/mangas']);
        });
    }
  }

  // getter
  get title() {
    return this.form.get('title');
  }
  
  get status() {
    return this.form.get('status');
  }
  
  get genre() {
    return this.form.get('genre');
  }
  
  get year() {
    return this.form.get('year');
  }
  
  get chapters() {
    return this.form.get('chapters');
  }
  
  get author() {
    return this.form.get('author');
  }
  
  get synopsis() {
    return this.form.get('synopsis');
  }
  
  get coverUrl() {
    return this.form.get('coverUrl');
  }
  
  
}