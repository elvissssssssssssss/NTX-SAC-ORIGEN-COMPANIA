// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/AdminAuth/login'; // 👈 tu endpoint real .NET
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkStoredUser();
  }

  // 🔐 Login con backend real
  login(email: string, password: string): Observable<boolean> {
    const body = { email, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<User>(this.apiUrl, body, { headers }).pipe(
      tap((user: User) => {
        // Guardar token y datos del usuario
        this.setCurrentUser(user);
      }),
      map(() => true),
      catchError((err) => {
        console.error('Error de login:', err);
        return of(false);
      })
    );
  }




logout(): void {
  localStorage.removeItem('currentUser');
  this.currentUserSubject.next(null);
  this.router.navigate(['/admin/login']);
}



  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === 'SuperAdmin' || user?.rol === 'Administrador';
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
isAuthenticated(): boolean {
  const user = this.currentUserSubject.value;
  return !!user && !!user.token;
}

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private checkStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
    }
  }
}
