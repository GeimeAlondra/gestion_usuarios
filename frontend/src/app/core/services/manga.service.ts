import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Manga {
  _id?: string;
  title: string;
  status: 'emision' | 'finalizado' | 'proximamente';
  genre: string;
  year: number;
  chapters: number;
  author: string;
  synopsis?: string;
  coverUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MangaService {

  private apiUrl = 'http://localhost:3000/api/mangas';

  constructor(private http: HttpClient) {}

  /* Obtener todos los mangas */
  getMangas(): Observable<Manga[]> {
    return this.http.get<Manga[]>(this.apiUrl);
  }

  /* Obtener uno */
  getManga(id: string): Observable<Manga> {
    return this.http.get<Manga>(`${this.apiUrl}/${id}`);
  }

  /* Crear */
  createManga(data: Manga): Observable<Manga> {
    return this.http.post<Manga>(this.apiUrl, data);
  }

  /* Actualizar */
  updateManga(id: string, data: Manga): Observable<Manga> {
    return this.http.put<Manga>(`${this.apiUrl}/${id}`, data);
  }

  /* Eliminar */
  deleteManga(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}