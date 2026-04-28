import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../core/components/navbar/navbar';
import { UsersService, User } from '../core/services/users.service';
import { AuthService } from '../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  imports: [NavbarComponent, DatePipe, LowerCasePipe, RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router)
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  isLoading = true;
  loadError = '';

  userToDelete: User | null = null;
  isDeleting = false;
  deleteError = '';
  deleteSuccess = '';

  get currentUserId(): string {
    return this.authService.getUser()?.id ?? '';
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadUsers();
    });

    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.loadError = '';

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = [...data];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.deleteError = '';
    this.deleteSuccess = '';
  }

  cancelDelete(): void {
    this.userToDelete = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.userToDelete || this.isDeleting) return;

    const idToDelete = this.userToDelete._id;
    const nameToDelete = this.userToDelete.name;

    this.isDeleting = true;
    this.deleteError = '';

    this.usersService.deleteUser(idToDelete).subscribe({
      next: () => {
        this.users = [...this.users.filter((u) => u._id !== idToDelete)];
        this.userToDelete = null;
        this.isDeleting = false;
        this.deleteSuccess = `El usuario "${nameToDelete}" fue eliminado correctamente.`;
        this.cdr.markForCheck();

        setTimeout(() => {
          this.deleteSuccess = '';
          this.cdr.markForCheck();
        }, 4000);
      },
      error: (err) => {
        this.deleteError =
          err?.error?.message ?? 'No se pudo eliminar el usuario. Intenta de nuevo.';
        this.isDeleting = false;
        this.cdr.markForCheck();
      },
    });
  }
}