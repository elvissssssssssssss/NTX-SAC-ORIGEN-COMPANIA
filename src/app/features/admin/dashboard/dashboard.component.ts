import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  summaryCards = [
    { 
      value: '150', 
      label: 'Pedidos nuevos', 
      icon: 'fa-shopping-bag', 
      color: 'primary',
      change: { value: '+12%', icon: 'fa-arrow-up', color: 'success' }
    },
    { 
      value: '53%', 
      label: 'Tasa de conversión', 
      icon: 'fa-percent', 
      color: 'info',
      change: { value: '+5%', icon: 'fa-arrow-up', color: 'success' }
    },
    { 
      value: '44', 
      label: 'Usuarios nuevos', 
      icon: 'fa-user-plus', 
      color: 'warning',
      change: { value: '-3%', icon: 'fa-arrow-down', color: 'danger' }
    },
    { 
      value: '$6,540', 
      label: 'Ingresos totales', 
      icon: 'fa-dollar-sign', 
      color: 'success',
      change: { value: '+18%', icon: 'fa-arrow-up', color: 'success' }
    }
  ];

  ngOnInit(): void {
    this.renderSalesChart();
    this.renderTopProductsChart();
    this.renderCategoriesChart();
  }

  renderSalesChart() {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Ventas',
          data: [120, 150, 180, 100, 200, 170, 210],
          backgroundColor: 'rgba(13,110,253,0.1)',
          borderColor: 'rgba(13,110,253,1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
             
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  renderTopProductsChart() {
    const canvas = document.getElementById('topProductsChart') as HTMLCanvasElement;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Camisetas', 'Pantalones', 'Zapatos', 'Accesorios', 'Otros'],
        datasets: [{
          label: 'Ventas',
          data: [45, 30, 25, 15, 10],
          backgroundColor: [
            'rgba(25,135,84,0.7)',
            'rgba(13,110,253,0.7)',
            'rgba(255,193,7,0.7)',
            'rgba(220,53,69,0.7)',
            'rgba(108,117,125,0.7)'
          ],
          borderColor: [
            'rgba(25,135,84,1)',
            'rgba(13,110,253,1)',
            'rgba(255,193,7,1)',
            'rgba(220,53,69,1)',
            'rgba(108,117,125,1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
             
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  renderCategoriesChart() {
    const canvas = document.getElementById('categoriesChart') as HTMLCanvasElement;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Hombre', 'Mujer', 'Niños', 'Accesorios'],
        datasets: [{
          data: [35, 40, 15, 10],
          backgroundColor: [
            'rgba(13,110,253,0.8)',
            'rgba(220,53,69,0.8)',
            'rgba(255,193,7,0.8)',
            'rgba(25,135,84,0.8)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
}