import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  serverError: string | null = null;
  emailServerError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.registerForm.get('email')!.valueChanges.subscribe(() => {
    this.emailServerError = null;
  });
  }

  get nombre() { return this.registerForm.get('nombre')!; }
  get email() { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.serverError = null;
    this.emailServerError = null;

    const { nombre, email, password } = this.registerForm.value;

    this.authService.register({ name: nombre, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;

        if (err.status === 409) {
          this.emailServerError = err.error?.message ?? 'El email ya está registrado';
          this.email.markAsTouched();
          this.cdr.detectChanges();
        } else if (err.status === 400) {
          const errors: { field: string; message: string }[] = err.error?.errors ?? [];
          for (const e of errors) {
            const controlName = e.field === 'name' ? 'nombre' : e.field;
            this.registerForm.get(controlName)?.setErrors({ serverError: e.message });
          }
        } else {
          this.serverError = 'Error en el servidor, intenta más tarde';
        }
      }
    });
  }
}
