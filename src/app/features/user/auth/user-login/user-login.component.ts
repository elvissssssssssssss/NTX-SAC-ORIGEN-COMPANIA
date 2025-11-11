import { Component } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  nombreUsuario: string = '';

  // ========== NUEVAS PROPIEDADES PARA OPTIMIZACIÓN ==========
  isLoading: boolean = false; // Para mostrar estado de carga
  
  // ========== CONFIGURACIÓN DE CACHE PARA RECORDAR EMAIL ==========
  private readonly EMAIL_CACHE_KEY = 'remembered_email'; // Cache para email si "recordarme" está activo

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // VERIFICAR SI YA ESTÁ LOGUEADO
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      this.nombreUsuario = user?.nombre || 'Usuario';
      
      // Si ya está logueado, redirigir automáticamente
      
      this.router.navigate(['/user/profile']);
      return;
    }

    // CARGAR EMAIL RECORDADO (si existe)
    this.cargarEmailRecordado();
  }

  onSubmit(): void {
    // VALIDACIÓN BÁSICA
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    // MOSTRAR ESTADO DE CARGA
    this.isLoading = true;
    this.error = ''; // Limpiar errores anteriores

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso');
        
        // GUARDAR EMAIL SI "RECORDARME" ESTÁ ACTIVO
        this.manejarRecordarEmail();
        
        // MOSTRAR MENSAJE DE ÉXITO (opcional)
        console.log(`👋 Bienvenido ${response.user?.nombre || 'Usuario'}`);
        
        this.isLoading = false;
        
        // REDIRIGIR A PERFIL
        this.router.navigate(['/user/profile']);
      },
      error: err => {
        console.error('❌ Error en login:', err);
        this.error = 'Credenciales incorrectas';
        this.isLoading = false;
        
        // LIMPIAR CONTRASEÑA POR SEGURIDAD
        this.password = '';
      }
    });
  }

  // ========== MÉTODOS DE CACHE PARA EMAIL ==========
  
  /**
   * Guardar email en cache si "recordarme" está activo
   */
  private manejarRecordarEmail(): void {
    if (this.rememberMe) {
      // GUARDAR EMAIL para próximas visitas
      try {
        localStorage.setItem(this.EMAIL_CACHE_KEY, this.email);
        console.log('📧 Email guardado para recordar');
      } catch (error) {
        console.warn('⚠️ No se pudo guardar el email');
      }
    } else {
      // ELIMINAR EMAIL guardado si no quiere ser recordado
      localStorage.removeItem(this.EMAIL_CACHE_KEY);
    }
  }

  /**
   * Cargar email recordado al inicializar
   */
  private cargarEmailRecordado(): void {
    try {
      const emailRecordado = localStorage.getItem(this.EMAIL_CACHE_KEY);
      if (emailRecordado) {
        this.email = emailRecordado;
        this.rememberMe = true; // Marcar checkbox automáticamente
        console.log('📧 Email recordado cargado');
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar email recordado');
    }
  }

  /**
   * Limpiar email recordado (si usuario desmarca "recordarme")
   */
  onRememberMeChange(): void {
    if (!this.rememberMe) {
      // Si desmarca "recordarme", eliminar email guardado
      localStorage.removeItem(this.EMAIL_CACHE_KEY);
      console.log('🗑️ Email recordado eliminado');
    }
  }

  // ========== MÉTODOS EXISTENTES MEJORADOS ==========
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  loginWithFacebook(event: Event): void {
    event.preventDefault();
    console.log('🔵 Facebook login iniciado');
    // Aquí iría la lógica de Facebook
    
    // NOTA: Si implementas Facebook login, también podrías usar cache
    // para recordar el estado de autenticación social
  }

  // ========== MÉTODOS ADICIONALES ÚTILES ==========
  
  /**
   * Limpiar formulario completamente
   */
  limpiarFormulario(): void {
    this.email = '';
    this.password = '';
    this.error = '';
    this.rememberMe = false;
    
    // También limpiar email recordado si lo hay
    localStorage.removeItem(this.EMAIL_CACHE_KEY);
  }

  /**
   * Verificar si hay conexión (opcional, para mostrar mensajes)
   */
  private verificarConexion(): boolean {
    return navigator.onLine;
  }
}