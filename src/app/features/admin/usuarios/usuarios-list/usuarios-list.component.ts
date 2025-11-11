// src/app/features/admin/usuarios/usuarios-list/usuarios-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuariosService, AdminAccount } from '../services/usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit {
  admins: AdminAccount[] = [];
  loading = true;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarAdmins();
  }

  cargarAdmins(): void {
    this.loading = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar administradores:', err);
        this.loading = false;
      }
    });
  }

  toggleActivo(admin: AdminAccount): void {
    const confirmMsg = admin.activo
      ? `¿Deseas desactivar la cuenta de ${admin.nombre}?`
      : `¿Deseas activar la cuenta de ${admin.nombre}?`;

    if (confirm(confirmMsg)) {
      this.usuariosService.toggleActive(admin.id).subscribe({
        next: (res) => {
          alert(res.message);
          this.cargarAdmins();
        },
        error: () => alert('Error al cambiar el estado.')
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar esta cuenta de administrador definitivamente?')) {
      this.usuariosService.delete(id).subscribe({
        next: () => {
          alert('Cuenta eliminada correctamente.');
          this.cargarAdmins();
        },
        error: () => alert('Error al eliminar la cuenta.')
      });
    }
  }
}