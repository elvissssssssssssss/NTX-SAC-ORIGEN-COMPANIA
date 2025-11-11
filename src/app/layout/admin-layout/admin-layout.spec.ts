// src/app/layout/admin-layout/admin-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.spec.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Admin Panel</h3>
        </div>
        
        <nav class="sidebar-nav">
          <ul>
            <li>
              <a routerLink="/admin/dashboard" routerLinkActive="active">
                <span class="icon">📊</span>
                Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/admin/products" routerLinkActive="active">
                <span class="icon">📦</span>
                Productos
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <h1>Panel de Administración</h1>
          </div>
          
          <div class="header-right" *ngIf="currentUser">
            <div class="user-info">
              <span class="welcome">Bienvenido, {{ currentUser.name }}</span>
              <button class="logout-btn" (click)="logout()">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background-color: #2c3e50;
      color: white;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #34495e;
      text-align: center;
    }

    .sidebar-header h3 {
      margin: 0;
      color: #ecf0f1;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav li {
      margin: 0;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      color: #bdc3c7;
      text-decoration: none;
      transition: all 0.3s;
    }

    .sidebar-nav a:hover {
      background-color: #34495e;
      color: #ecf0f1;
    }

    .sidebar-nav a.active {
      background-color: #3498db;
      color: white;
    }

    .sidebar-nav .icon {
      margin-right: 10px;
      font-size: 18px;
    }

    /* Main Content */
    .main-content {
      margin-left: 250px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .header {
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 0 30px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 24px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .welcome {
      color: #555;
      font-weight: 500;
    }

    .logout-btn {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .logout-btn:hover {
      background-color: #c0392b;
    }

    /* Content */
    .content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 200px;
        transform: translateX(-100%);
        transition: transform 0.3s;
      }

      .main-content {
        margin-left: 0;
      }

      .header {
        padding: 0 15px;
      }

      .content {
        padding: 20px 15px;
      }
    }
  `]
})
export class AdminLayoutComponent {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}