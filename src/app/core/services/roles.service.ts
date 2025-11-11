// src/app/features/admin/roles/services/roles.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  id?: number;
  nombre: string;
  descripcion: string;
  creadoPor?: number | null;
  creadoEn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  create(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  update(id: number, rol: Rol): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, rol);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
