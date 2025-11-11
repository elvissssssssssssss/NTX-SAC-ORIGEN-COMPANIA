// src/app/features/admin/roles/roles-list/roles-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RolesService, Rol } from '../../../../../app/core/services/roles.service';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.css']
})
export class RolesListComponent implements OnInit {
  roles: Rol[] = [];
  loading = true;
  error = '';

  constructor(private rolesService: RolesService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los roles.';
        this.loading = false;
      }
    });
  }

  deleteRole(id: number): void {
    if (confirm('¿Estás seguro de eliminar este rol?')) {
      this.rolesService.delete(id).subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.id !== id);
        },
        error: () => {
          alert('No se pudo eliminar el rol.');
        }
      });
    }
  }
}
