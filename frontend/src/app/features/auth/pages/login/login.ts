import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', Validators.required],
    });

  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  onSubmit(): void {

    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.serverError = null;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({

      next: (res) => {

        this.isLoading = false;

        /* Guardar sesión */
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        const role = res.user.role;

        /* Redirección por rol */
        if (role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'Editor') {
          this.router.navigate(['/mangas']);
        } else if (role === 'Viewer') {
          this.router.navigate(['/mangas']);
        } else {
          this.router.navigate(['/login']);
        }
      },

      error: (err: HttpErrorResponse) => {

        this.isLoading = false;

        if (err.status === 401) {
          this.serverError = 'Credenciales inválidas';
        } else if (err.status === 403) {
          this.serverError = 'Tu cuenta está desactivada';
        } else {
          this.serverError = 'Error en el servidor, intenta más tarde';
        }
        this.cdr.detectChanges();
      }
    });
  }
}