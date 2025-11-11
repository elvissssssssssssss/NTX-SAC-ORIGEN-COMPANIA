// src/app/shared/components/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Página no encontrada</h1>
        <p>Lo sentimos, la página que buscas no existe.</p>
        <div class="actions">
          <a routerLink="/admin/dashboard" class="btn btn-primary">
            🏠 Ir al Dashboard
          </a>
          <button class="btn btn-outline" (click)="goBack()">
            ← Volver atrás
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }

    .not-found-content {
      max-width: 500px;
    }

    .error-code {
      font-size: 6rem;
      font-weight: bold;
      color: #d32f2f;
    }

    .actions {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }

    .btn-primary {
      background-color: #1976d2;
      color: white;
      border: none;
    }

    .btn-outline {
      border: 1px solid #1976d2;
      background-color: transparent;
      color: #1976d2;
    }
  `]
})
export class NotFoundComponent {
  goBack(): void {
    history.back();
  }
}
