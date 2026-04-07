import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  userName: string;

  constructor(private authService: AuthService) {
    const user = this.authService.getUser();
    this.userName = user?.name ?? 'Usuario';
  }

  logout(): void {
    this.authService.logout();
  }
}
