import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Editor' | 'Viewer';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'Admin' | 'Editor' | 'Viewer';
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = 'https://gestion-backend-8p1l.onrender.com/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}