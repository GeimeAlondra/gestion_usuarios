import { Component, OnInit, inject } from '@angular/core';
import { NavbarComponent } from '../core/components/navbar/navbar';
import { AuthService } from '../core/services/auth.service';
import { StatsService, Stats } from '../core/services/stats.service';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private statsService = inject(StatsService);

  userName: string;
  stats: Stats | null = null;
  isLoading = true;
  statsError = '';

  constructor() {
    const user = this.authService.getUser();
    this.userName = user?.name ?? 'Usuario';
  }

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.statsError = 'No se pudieron cargar las estadísticas.';
        this.isLoading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
