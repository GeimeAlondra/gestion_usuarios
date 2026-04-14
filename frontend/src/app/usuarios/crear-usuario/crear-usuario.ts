import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../core/components/navbar/navbar';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-crear-usuario',
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css',
})
export class CrearUsuarioComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Viewer' as 'Admin' | 'Editor' | 'Viewer', Validators.required],
  });

  isSaving = false;
  serverError = '';

  get name() { return this.form.get('name')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get role() { return this.form.get('role')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.serverError = '';

    this.usersService.createUser(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        if (err.status === 409) {
          this.serverError = 'El correo ya está registrado.';
        } else {
          this.serverError = 'Ocurrió un error al crear el usuario.';
        }
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }
}
