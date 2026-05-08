import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MangaService, Manga } from '../../core/services/manga.service';
import { MangaNavbarComponent } from '../../core/components/manga-navbar/manga-navbar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manga-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MangaNavbarComponent, RouterLink],
  templateUrl: './manga-form.html',
  styleUrls: ['./manga-form.css'],
})
export class MangaFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isAddingGenre = false;
  mangaId: string | null = null;

  genresList: any[] = [];

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
      genres: [[], Validators.required],
      mainGenre: ['', Validators.required],
      year: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(1900), Validators.max(2026)],
      ],
      chapters: [0, [Validators.required, Validators.min(0)]],
      author: ['', Validators.required],
      synopsis: ['', [Validators.maxLength(1000)]],
      coverUrl: ['', [Validators.required]],
    });

    this.form.get('genres')?.valueChanges.subscribe((selected: string[]) => {
      const main = this.form.get('mainGenre')?.value;

      if (main && !selected.includes(main)) {
        this.form.get('mainGenre')?.setValue('');
      }
    });
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${this.apiBase}/genres`).subscribe((res) => {
      this.genresList = res || [];
    });

    this.mangaId = this.route.snapshot.paramMap.get('id');

    if (this.mangaId) {
      this.isEditMode = true;

      this.mangaService.getManga(this.mangaId).subscribe((manga) => {
        this.form.patchValue({
          ...manga,
          genres: manga.genres?.map((g: any) => g._id),
          mainGenre: manga.mainGenre?._id,
        });

        if (manga.coverUrl) {
          this.previewUrl = manga.coverUrl;
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

    const genres = this.form.value.genres || [];

    if (!genres.includes(this.form.value.mainGenre)) {
      alert('El género principal debe estar dentro de los géneros seleccionados');
      return;
    }
    
    const data: Manga = {
      title: this.form.value.title,
      status: this.form.value.status,
      year: Number(this.form.value.year),
      chapters: Number(this.form.value.chapters),
      author: this.form.value.author,
      synopsis: this.form.value.synopsis,
      coverUrl: this.form.value.coverUrl,

      genres: Array.isArray(this.form.value.genres)
        ? this.form.value.genres
        : [this.form.value.genres],
      mainGenre: this.form.value.mainGenre,
    };

    if (this.isEditMode && this.mangaId) {
      this.mangaService
        .updateManga(this.mangaId, data)
        .subscribe(() => this.router.navigate(['/mangas']));
    } else {
      this.mangaService.createManga(data).subscribe(() => this.router.navigate(['/mangas']));
    }
  }

  newGenre = '';

  addGenre(): void {
    const genreName = this.newGenre.trim();
    if (!genreName || this.isAddingGenre) return;

    const exists = this.genresList.some((g) => g.name.toLowerCase() === genreName.toLowerCase());
    if (exists) {
      alert('Este género ya existe en la lista');
      return;
    }

    this.isAddingGenre = true;

    this.http
      .post<any>(`${this.apiBase}/genres`, { name: genreName })
      .subscribe({
        next: (genre) => {
          this.genresList = [...this.genresList, genre];
          const currentGenres = this.form.get('genres')?.value || [];
          this.form.get('genres')?.setValue([...currentGenres, genre._id]);

          this.newGenre = '';
          this.isAddingGenre = false;

        },
        error: (err) => {
          this.isAddingGenre = false;
          alert(err.error?.message || 'Error al crear género');
        },
      });
  }

  // Añade este método en tu archivo .ts
  toggleGenre(genreId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentGenres = [...(this.form.get('genres')?.value || [])];

    if (checkbox.checked) {
      // Si se marca y no está en el array, lo añadimos
      if (!currentGenres.includes(genreId)) {
        currentGenres.push(genreId);
      }
    } else {
      // Si se desmarca, lo filtramos para quitarlo
      const index = currentGenres.indexOf(genreId);
      if (index > -1) {
        currentGenres.splice(index, 1);
      }
    }

    // Actualizamos el valor del formulario
    this.form.get('genres')?.setValue(currentGenres);
    this.form.get('genres')?.markAsTouched();
  }

  get title() {
    return this.form.get('title');
  }
  get status() {
    return this.form.get('status');
  }
  get genres() {
    return this.form.get('genres');
  }
  get mainGenre() {
    return this.form.get('mainGenre');
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
