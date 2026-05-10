import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stats {
  total: number;
  activos: number;
  inactivos: number;
  porRol: {
    Admin: number;
    Editor: number;
    Viewer: number;
  };
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = 'https://gestion-usuarios-0st5.onrender.com/api/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(this.apiUrl);
  }
}