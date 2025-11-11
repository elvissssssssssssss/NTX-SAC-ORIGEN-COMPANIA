// src/app/features/admin/usuarios/usuarios-create/usuarios-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { RolesService, Rol } from '../../../../../app/core/services/roles.service';

@Component({
  selector: 'app-usuarios-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-create.component.html',
  styleUrls: ['./usuarios-create.component.css']
})
export class UsuariosCreateComponent implements OnInit {
  form!: FormGroup;
  roles: Rol[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rolId: [0, Validators.required]
    });

    this.rolesService.getAll().subscribe({
      next: (data) => (this.roles = data),
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.isLoading = true;

    this.usuariosService.create(this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/usuarios']);
      },
      error: () => {
        this.isLoading = false;
        alert('Error al crear el administrador.');
      }
    });
  }
}
