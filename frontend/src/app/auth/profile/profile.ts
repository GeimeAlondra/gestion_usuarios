import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, LowerCasePipe, UpperCasePipe} from '@angular/common';
import { MangaNavbarComponent } from '../../core/components/manga-navbar/manga-navbar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [MangaNavbarComponent, ReactiveFormsModule, DatePipe, LowerCasePipe, UpperCasePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSaving = false;
  isEditing = false;
  serverError = '';
  successMsg = '';
  currentUser: any = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
  });

  get name() { return this.form.get('name')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.form.patchValue({ name: user.name, email: user.email, password: '' });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.serverError = 'No se pudo cargar el perfil.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.serverError = '';
    this.successMsg = '';
    this.form.patchValue({ name: this.currentUser.name, email: this.currentUser.email, password: '' });
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.serverError = '';
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.serverError = '';

    const raw = this.form.getRawValue();
    const payload: any = { name: raw.name, email: raw.email };
    if (raw.password && raw.password.trim().length >= 6) {
      payload.password = raw.password;
    }

    this.authService.updateProfile(payload).subscribe({
      next: (updated) => {
        // Actualizar localStorage
        const stored = this.authService.getUser();
        if (stored) {
          stored.name = updated.name;
          stored.email = updated.email;
          localStorage.setItem('user', JSON.stringify(stored));
        }
        // Recargar perfil desde el servidor y volver a vista card
        this.isSaving = false;
        this.isEditing = false;
        this.successMsg = 'Perfil actualizado correctamente.';
        this.loadProfile();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        this.serverError = err.status === 409
          ? 'El correo ya está en uso por otro usuario.'
          : 'No se pudo actualizar el perfil.';
        this.cdr.markForCheck();
      },
    });
  }
}