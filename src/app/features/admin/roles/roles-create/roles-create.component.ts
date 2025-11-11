// src/app/features/admin/roles/roles-create/roles-create.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RolesService, Rol } from '../../../../../app/core/services/roles.service';

@Component({
  selector: 'app-roles-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-create.component.html',
  styleUrls: ['./roles-create.component.css']
})
export class RolesCreateComponent {
  roleForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rolesService: RolesService
  ) {
    this.roleForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) return;

    this.isLoading = true;
    const newRole = this.roleForm.value;

    this.rolesService.create(newRole).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/roles']);
      },
      error: () => {
        this.error = 'Error al crear el rol.';
        this.isLoading = false;
      }
    });
  }
}
