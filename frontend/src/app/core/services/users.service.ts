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

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }
}