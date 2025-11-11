import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        // Guarda el token y el usuario en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

 logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  register(user: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
}): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user).pipe(
    tap(response => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    })
  );
}
// Obtener todos los usuarios (solo para administradores)
getAllUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/users`);
}

}
