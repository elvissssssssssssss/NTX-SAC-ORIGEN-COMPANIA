// src/app/features/admin/auth/admin-login/admin-login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
    templateUrl: './admin-login.component.html',  // ✅ ruta correcta
  styleUrls: ['./admin-login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Acceso Administrativo</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="admin@example.com"
            >
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email requerido y válido
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              
            >
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Contraseña requerida
            </div>
          </div>

          <div class="error-message" *ngIf="loginError">
            {{ loginError }}
          </div>

          <button 
            type="submit" 
            class="login-button"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading">Verificando...</span>
          </button>
        </form>

        <div class="login-help">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Email: admin&#64;gmail.com</p>
          <p>Contraseña: admin123</p>
        </div>
      </div>
    </div>
  `,
  
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .login-header p {
      color: #666;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }

    .login-button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .login-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-help {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 14px;
      color: #666;
    }

    .login-help p {
      margin: 5px 0;
    }
  `]
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.loginError = 'Credenciales incorrectas';
          }
        },
        error: () => {
          this.isLoading = false;
          this.loginError = 'Error al iniciar sesión';
        }
      });
    }
  }
}