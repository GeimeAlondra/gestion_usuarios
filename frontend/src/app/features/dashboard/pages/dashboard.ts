import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { StatsService, Stats } from '../../../core/services/stats.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MangaNavbarComponent } from "../../../core/layouts/manga-navbar/manga-navbar";


@Component({
 selector: 'app-dashboard',
 imports: [MangaNavbarComponent],
 templateUrl: './dashboard.html',
 styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
 private authService = inject(AuthService);
 private statsService = inject(StatsService);
 private router = inject(Router);
 private cdr = inject(ChangeDetectorRef);


 userName: string;
 stats: Stats | null = null;
 isLoading = true;
 statsError = '';


 constructor() {
   const user = this.authService.getUser();
   this.userName = user?.name ?? 'Usuario';
 }


 ngOnInit(): void {
   this.router.events.pipe(
     filter(event => event instanceof NavigationEnd)
   ).subscribe(() => {
     this.loadStats();
   });


   this.loadStats();
 }


 private loadStats(): void {
   this.isLoading = true;
   this.statsError = '';


   this.statsService.getStats().subscribe({
     next: (data) => {
       this.stats = {...data};
       this.isLoading = false;
       this.cdr.markForCheck();
     },
     error: () => {
       this.statsError = 'No se pudieron cargar las estadísticas.';
       this.isLoading = false;
       this.cdr.markForCheck();
     },
   });
 }


 logout(): void {
   this.authService.logout();
 }
}



