import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActivityLog {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  userRole: 'Admin' | 'Editor' | 'Viewer';
  action: string;
  actionLabel: string;
  entity: 'manga' | 'user' | 'session' | 'profile';
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  ip: string | null;
  createdAt: string;
}

export interface ActivityResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  logs: ActivityLog[];
}

export interface ActivityFilters {
  userId?: string;
  role?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ActivitySummary {
  byAction: { action: string; label: string; count: number; lastOccurrence: string }[];
  byRole: { role: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private apiUrl = 'https://gestion-backend-8p1l.onrender.com/api/activity';

  constructor(private http: HttpClient) {}

  getLogs(filters: ActivityFilters = {}): Observable<ActivityResponse> {
    let params = new HttpParams();
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));
    return this.http.get<ActivityResponse>(this.apiUrl, { params });
  }

  getMyLogs(page = 1, limit = 20): Observable<ActivityResponse> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<ActivityResponse>(`${this.apiUrl}/me`, { params });
  }

  getSummary(): Observable<ActivitySummary> {
    return this.http.get<ActivitySummary>(`${this.apiUrl}/summary`);
  }

  clearLogs(before?: string): Observable<{ message: string }> {
    let params = new HttpParams();
    if (before) params = params.set('before', before);
    return this.http.delete<{ message: string }>(this.apiUrl, { params });
  }

  getEditorLogs(filters: ActivityFilters = {}): Observable<ActivityResponse> {
  let params = new HttpParams();
  if (filters.action) params = params.set('action', filters.action);
  if (filters.from) params = params.set('from', filters.from);
  if (filters.to) params = params.set('to', filters.to);
  if (filters.page) params = params.set('page', String(filters.page));
  if (filters.limit) params = params.set('limit', String(filters.limit));
  return this.http.get<ActivityResponse>(`${this.apiUrl}/editor`, { params });
}
}
