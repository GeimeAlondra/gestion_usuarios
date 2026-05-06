import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MangaService, Manga } from '../../core/services/manga.service';
import { MangaNavbarComponent } from '../../core/components/manga-navbar/manga-navbar';

@Component({
  selector: 'app-manga-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MangaNavbarComponent, RouterLink],
  templateUrl: './manga-form.html',
  styleUrls: ['./manga-form.css'],
})
export class MangaFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  mangaId: string | null = null;

  coverMode: 'url' | 'file' = 'url';
  previewUrl = '';
  isUploading = false;
  uploadError = '';

  private readonly apiBase = 'http://localhost:3000/api';

  constructor(
    private fb: FormBuilder,
    private mangaService: MangaService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['emision', Validators.required],
      genre: ['', Validators.required],
      year: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(1900), Validators.max(2026)],
      ],
      chapters: [0, [Validators.required, Validators.min(0)]],
      author: ['', Validators.required],
      synopsis: ['', [Validators.maxLength(1000)]],
      coverUrl: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.mangaId = this.route.snapshot.paramMap.get('id');
    if (this.mangaId) {
      this.isEditMode = true;
      this.mangaService.getManga(this.mangaId).subscribe((manga) => {
        this.form.patchValue(manga);
        if (manga.coverUrl) {
          this.previewUrl = manga.coverUrl;
          // Si la URL es de Cloudinary ya estaba subida antes
          this.coverMode = manga.coverUrl.includes('cloudinary') ? 'file' : 'url';
        }
      });
    }
  }

  setCoverMode(mode: 'url' | 'file'): void {
    this.coverMode = mode;
    this.uploadError = '';
    this.previewUrl = '';
    this.form.get('coverUrl')?.setValue('');
  }

  onUrlInput(event: Event): void {
    this.previewUrl = (event.target as HTMLInputElement).value;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Preview local inmediato mientras sube
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary vía el backend
    this.isUploading = true;
    this.uploadError = '';
    this.form.get('coverUrl')?.setValue('');

    const formData = new FormData();
    formData.append('cover', file);

    this.http.post<{ url: string }>(`${this.apiBase}/mangas/upload-cover`, formData).subscribe({
      next: (res) => {
        this.form.get('coverUrl')?.setValue(res.url); // URL permanente de Cloudinary
        this.previewUrl = res.url;
        this.isUploading = false;
      },
      error: () => {
        this.uploadError = 'Error al subir la imagen. Intenta de nuevo.';
        this.isUploading = false;
        this.previewUrl = '';
      },
    });
  }

  removeCover(): void {
    this.previewUrl = '';
    this.form.get('coverUrl')?.setValue('');
  }

  save(): void {
    if (this.form.invalid || this.isUploading) return;

    const data: Manga = {
      title: this.form.value.title,
      status: this.form.value.status,
      genre: this.form.value.genre,
      year: Number(this.form.value.year),
      chapters: Number(this.form.value.chapters),
      author: this.form.value.author,
      synopsis: this.form.value.synopsis,
      coverUrl: this.form.value.coverUrl,
    };

    if (this.isEditMode && this.mangaId) {
      this.mangaService
        .updateManga(this.mangaId, data)
        .subscribe(() => this.router.navigate(['/mangas']));
    } else {
      this.mangaService.createManga(data).subscribe(() => this.router.navigate(['/mangas']));
    }
  }

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
