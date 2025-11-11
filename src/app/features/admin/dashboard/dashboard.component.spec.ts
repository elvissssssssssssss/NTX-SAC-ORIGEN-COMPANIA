// src/app/features/admin/dashboard/dashboard.spec.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <p>Resumen general del sistema</p>
      </div>

      <!-- Cards de resumen -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>{{ totalProducts }}</h3>
            <p>Total Productos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🛍️</div>
          <div class="stat-info">
            <h3>{{ totalOrders }}</h3>
            <p>Pedidos Hoy</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ totalUsers }}</h3>
            <p>Usuarios Activos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>S/{{ totalRevenue }}</h3>
            <p>Ingresos del Mes</p>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div class="actions-grid">
          <a routerLink="/admin/products" class="action-card">
            <div class="action-icon">📦</div>
            <div class="action-content">
              <h4>Ver Productos</h4>
              <p>Gestionar inventario</p>
            </div>
          </a>

          <div class="action-card disabled">
            <div class="action-icon">➕</div>
            <div class="action-content">
              <h4>Agregar Producto</h4>
              <p>Próximamente</p>
            </div>
          </div>

          <div class="action-card disabled">
            <div class="action-icon">📊</div>
            <div class="action-content">
              <h4>Ver Reportes</h4>
              <p>Próximamente</p>
            </div>
          </div>

          <div class="action-card disabled">
            <div class="action-icon">⚙️</div>
            <div class="action-content">
              <h4>Configuración</h4>
              <p>Próximamente</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividad reciente -->
      <div class="recent-activity">
        <h3>Actividad Reciente</h3>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of recentActivities">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <p><strong>{{ activity.title }}</strong></p>
              <p class="activity-description">{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .stats-grid, .actions-grid, .activity-list {
      display: grid;
      gap: 1rem;
    }
    .stats-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .actions-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .stat-card, .action-card {
      background: #fff;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .action-card.disabled { opacity: 0.5; cursor: not-allowed; }
    .recent-activity .activity-item {
      display: flex;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ddd;
    }
    .activity-icon { font-size: 1.5rem; }
    .activity-time { font-size: 0.8rem; color: gray; }
  `]
})
export class DashboardComponent {
  totalProducts = 120;
  totalOrders = 18;
  totalUsers = 52;
  totalRevenue = 9800;

  recentActivities = [
    {
      icon: '🛒',
      title: 'Nueva compra registrada',
      description: 'Usuario Juan Pérez compró 3 productos.',
      time: 'Hace 2 horas'
    },
    {
      icon: '➕',
      title: 'Nuevo producto agregado',
      description: 'Se agregó "Camisa Polo Azul".',
      time: 'Hoy a las 10:15 AM'
    },
    {
      icon: '👤',
      title: 'Nuevo usuario registrado',
      description: 'Cuenta creada por María Gómez.',
      time: 'Ayer a las 5:30 PM'
    }
  ];
}
