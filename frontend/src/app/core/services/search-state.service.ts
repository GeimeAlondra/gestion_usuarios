import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private isSearchSource = new BehaviorSubject<boolean>(false);
  isSearch$ = this.isSearchSource.asObservable();

  toggleSearch() {
    this.isSearchSource.next(!this.isSearchSource.value);
  }

  resetSearch() {
    this.isSearchSource.next(false);
  }

  // En SearchStateService
    constructor(private router: Router) {
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
        this.resetSearch(); // Se oculta al cambiar de ruta
        }
    });
    }

}

