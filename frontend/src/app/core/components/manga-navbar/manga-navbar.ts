import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
 selector: 'app-manga-navbar',
 standalone: true,
 imports: [
   CommonModule,
   RouterModule
 ],
 templateUrl: './manga-navbar.html',
 styleUrls: ['./manga-navbar.css']
})
export class MangaNavbarComponent {


 private authService = inject(AuthService);
 private router = inject(Router);


 user = this.authService.getUser();


 logout(): void {


   localStorage.removeItem('token');
   localStorage.removeItem('user');
   this.router.navigate(['/login']);


 }


 isAdmin(): boolean {
   return this.user?.role === 'Admin';
 }


 isEditor(): boolean {
   return this.user?.role === 'Editor';
 }


}



