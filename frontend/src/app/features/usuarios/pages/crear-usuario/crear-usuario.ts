import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../../../../core/services/users.service';
import { MangaNavbarComponent } from "../../../../core/layouts/manga-navbar/manga-navbar";


@Component({
 selector: 'app-crear-usuario',
 imports: [ReactiveFormsModule, FormsModule, MangaNavbarComponent],
 templateUrl: './crear-usuario.html',
 styleUrl: './crear-usuario.css',
})
export class CrearUsuarioComponent implements OnInit {
 private fb = inject(FormBuilder);
 private usersService = inject(UsersService);
 private router = inject(Router);
 private route = inject(ActivatedRoute);


 editId: string | null = null;
 isEditMode = false;
 isLoadingUser = false;


 form = this.fb.group({
   name: ['', [Validators.required, Validators.minLength(2)]],
   email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/)]],
   password: ['', [Validators.required, Validators.minLength(6)]],
   role: ['Viewer' as 'Admin' | 'Editor' | 'Viewer', Validators.required],
   isActive: [true],
 });


 isSaving = false;
 serverError = '';


 get name() { return this.form.get('name')!; }
 get email() { return this.form.get('email')!; }
 get password() { return this.form.get('password')!; }
 get role() { return this.form.get('role')!; }
 get isActive() { return this.form.get('isActive')!; }


 ngOnInit(): void {
   this.editId = this.route.snapshot.paramMap.get('id');
   this.isEditMode = !!this.editId;


   if (this.isEditMode) {
     // En modo edición la contraseña es opcional
     this.password.clearValidators();
     this.password.addValidators(Validators.minLength(6));
     this.password.updateValueAndValidity();


     this.isLoadingUser = true;
     this.usersService.getUserById(this.editId!).subscribe({
       next: (user) => {
         this.form.patchValue({
           name: user.name,
           email: user.email,
           role: user.role,
           isActive: user.isActive,
         });
         this.isLoadingUser = false;
       },
       error: () => {
         this.serverError = 'No se pudo cargar la información del usuario.';
         this.isLoadingUser = false;
       },
     });
   }
 }


 onSubmit(): void {
   if (this.form.invalid) {
     this.form.markAllAsTouched();
     return;
   }


   this.isSaving = true;
   this.serverError = '';


   if (this.isEditMode) {
     const raw = this.form.getRawValue();
     const payload: any = {
       name: raw.name,
       email: raw.email,
       role: raw.role,
       isActive: raw.isActive,
     };
     if (raw.password && raw.password.trim().length > 0) {
       payload.password = raw.password;
     }


     this.usersService.updateUser(this.editId!, payload).subscribe({
       next: () => this.router.navigate(['/usuarios']),
       error: (err: HttpErrorResponse) => {
         this.isSaving = false;
         if (err.status === 409) {
           this.serverError = 'El correo ya está registrado por otro usuario.';
         } else {
           this.serverError = 'Ocurrió un error al actualizar el usuario.';
         }
       },
     });
   } else {
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
 }


 onCancel(): void {
   this.router.navigate(['/usuarios']);
 }
}

