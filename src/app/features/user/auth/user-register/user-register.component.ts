import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegistercomponent {

 email = '';
  password = '';
  nombre = '';
  apellido = '';
  fecha_nacimiento = '';
  error = '';
    // Propiedades del formulario

  password_confirmation: string = '';

  dia: string = '';
  mes: string = '';
  anio: string = '';
  
  // Control de errores
  errors: string[] = [];
  showPasswordConfirmation: boolean = false;
  
  // Datos para los selectores
  dias: number[] = Array.from({length: 31}, (_, i) => i + 1);
  meses = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];
  anios: number[] = Array.from({length: 41}, (_, i) => 2008 - i);

constructor(private authService: AuthService, private router: Router) {}

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  onSubmit(): void {
    this.errors = [];

    // Validar confirmación de contraseña
    if (this.password !== this.password_confirmation) {
      this.errors.push('Las contraseñas no coinciden.');
    }

    // Validar fecha completa
    if (!this.dia || !this.mes || !this.anio) {
      this.errors.push('Debe seleccionar una fecha de nacimiento completa.');
    }

    if (this.errors.length > 0) return;

    // Construir fecha con formato YYYY-MM-DD
    const fecha_nacimiento = `${this.anio}-${this.mes}-${this.dia.padStart(2, '0')}`;

    this.authService.register({
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      apellido: this.apellido,
      fecha_nacimiento
    }).subscribe({
      next: () => this.router.navigate(['/user/profile']),
      error: () => this.errors.push('Error al registrar. Intenta nuevamente.')
    });
  }
}