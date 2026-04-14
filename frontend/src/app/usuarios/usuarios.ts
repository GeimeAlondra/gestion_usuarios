import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../core/components/navbar/navbar';
import { UsersService, User } from '../core/services/users.service';

@Component({
  selector: 'app-usuarios',
  imports: [NavbarComponent, DatePipe, LowerCasePipe, RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  private usersService = inject(UsersService);

  users: User[] = [];
  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
      },
    });
  }
}
