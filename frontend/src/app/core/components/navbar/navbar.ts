import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  private authService = inject(AuthService);

  userName: string;

  constructor() {
    const user = this.authService.getUser();
    this.userName = user?.name ?? 'Usuario';
  }

  logout(): void {
    this.authService.logout();
  }
}
