// src/app/features/admin/usuarios/services/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminAccount {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol?: string;
  rolId?: number;
  activo: boolean;
  creadoEn?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Admins';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminAccount[]> {
    return this.http.get<AdminAccount[]>(this.apiUrl);
  }

  getById(id: number): Observable<AdminAccount> {
    return this.http.get<AdminAccount>(`${this.apiUrl}/${id}`);
  }

  create(admin: Partial<AdminAccount>): Observable<AdminAccount> {
    return this.http.post<AdminAccount>(this.apiUrl, admin);
  }

  toggleActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
