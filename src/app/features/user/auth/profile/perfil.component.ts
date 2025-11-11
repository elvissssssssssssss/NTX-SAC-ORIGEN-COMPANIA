  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { AuthService } from '../../auth/services/auth.service';        // ajusta la ruta si cambiaste carpetas
  import { User } from '../../auth/models/user.model';       
  import { Router } from '@angular/router'; // asegúrate de tenerlo importado
  import { EnvioVoletaService } from '../../../../services/envioVoleta.services';
  import { EstadoEnvio, SeguimientoEnvio, DocumentoEnvio } from '../../../../core/models/envioVoleta';
  import { RouterModule } from '@angular/router';

  @Component({
    selector: 'app-perfil',
    standalone: true,                       // 👈  para usar loadComponent
      imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.css']
  })
  export class PerfilComponent implements OnInit {
  // Formularios
   busquedaForm!: FormGroup;
  seguimientos: SeguimientoEnvio[] = [];
  ventaSeleccionada: number | null = null;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  cargando = false;
  profileForm!: FormGroup;
  // Datos
  estados: EstadoEnvio[] = [];
  
  documentos: DocumentoEnvio[] = [];

  // Estado de la interfaz
  archivoSeleccionado: File | null = null;

  // Flags de carga
 
  enviandoSeguimiento = false;
  subiendoDocumento = false;
  confirmandoEntrega = false;

  // Mensajes


  // Usuario
  user!: User | null;
  isEditing = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private envioService: EnvioVoletaService
  ) {}

ngOnInit(): void {
  this.user = this.authService.getUser();

  this.profileForm = this.fb.group({
    nombre: [this.user?.nombre || '', Validators.required],
    apellido: [this.user?.apellido || '', Validators.required],
    email: [this.user?.email || '', [Validators.required, Validators.email]],
    fecha_nacimiento: [this.user?.fecha_nacimiento?.split('T')[0] || '', Validators.required]
  });

  this.profileForm.disable(); // inicialmente no editable

  // ✅ Inicializar formulario de búsqueda
  this.busquedaForm = this.fb.group({
    ventaId: ['', Validators.required]
  });
}

  toggleEdit(): void {
    this.isEditing = true;
    this.profileForm.enable();
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedUser = {
        ...this.user,
        ...this.profileForm.value
      };

      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Actualizar referencia local
      this.user = updatedUser;

      this.isEditing = false;
      this.profileForm.disable(); // deshabilita después de guardar
    }
  }

  
  logout(): void {
  this.authService.logout();
  // Mostrar alerta de éxito (opcional)
  // this.toastr.success('Sesión cerrada', 'Éxito');
  this.router.navigate(['/auth/login']);
}




////////////////////////// ENVÍOS Y BOLETAS //////////////////////



  puedeConfirmarEntrega(): boolean {
    if (this.seguimientos.length === 0) return false;
    
    const ultimoSeguimiento = this.seguimientos[this.seguimientos.length - 1];
    
    // Puede confirmar si el último estado es "Listo para Recojo" (id: 4) o "En Camino" (id: 3)
    // y no está confirmado por el cliente
    return (ultimoSeguimiento.estado_id === 3 || ultimoSeguimiento.estado_id === 4) && 
           !ultimoSeguimiento.confirmado_por_cliente;
  }
    buscarEnvio(): void {
    if (this.busquedaForm.invalid) return;
    
    const ventaId = this.busquedaForm.value.ventaId;
    this.cargando = true;
    this.ventaSeleccionada = ventaId;
    
    // Cargar seguimientos y documentos en paralelo
    Promise.all([
      this.cargarSeguimientos(ventaId),
      this.cargarDocumentos(ventaId)
    ]).finally(() => {
      this.cargando = false;
    });
  }

  private cargarSeguimientos(ventaId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.envioService.getSeguimiento(ventaId).subscribe({
        next: (seguimientos) => {
          this.seguimientos = seguimientos.sort((a, b) => 
            new Date(a.fecha_cambio || '').getTime() - new Date(b.fecha_cambio || '').getTime()
          );
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar seguimientos:', error);
          this.seguimientos = [];
          this.mostrarMensaje('Error al cargar el seguimiento', 'error');
          reject(error);
        }
      });
    });
  }

  private cargarDocumentos(ventaId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.envioService.getDocumentos(ventaId).subscribe({
        next: (documentos) => {
          this.documentos = documentos.sort((a, b) => 
            new Date(b.fecha_subida || '').getTime() - new Date(a.fecha_subida || '').getTime()
          );
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar documentos:', error);
          this.documentos = [];
          this.mostrarMensaje('Error al cargar los documentos', 'error');
          reject(error);
        }
      });
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => this.mensaje = '', 5000); // Limpia el mensaje después de 5 segundos
  }
  
 confirmarEntregaEnvio(): void {
  if (!this.ventaSeleccionada) return;

  this.confirmandoEntrega = true;

  this.envioService.confirmarEntrega(this.ventaSeleccionada).subscribe({
    next: (response) => {
      this.mostrarMensaje('Entrega confirmada correctamente', 'success');
      this.cargarSeguimientos(this.ventaSeleccionada!);
    },
    error: (error) => {
      console.error('Error al confirmar entrega:', error);
      this.mostrarMensaje('Error al confirmar la entrega', 'error');
    },
    complete: () => {
      this.confirmandoEntrega = false;
    }
  });
}


 cerrarMensaje(): void {
    this.mensaje = '';
  }

   getTipoDocumentoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'boleta': 'Boleta',
      'foto_envio': 'Foto del Envío',
      'guia_remision': 'Guía de Remisión',
      'comprobante_entrega': 'Comprobante de Entrega'
    };
    
    return tipos[tipo] || tipo;
  }

  descargarDocumento(documento: DocumentoEnvio): void {
    // Construir la URL completa del documento
    const url = `https://pusher-backend-elvis.onrender.com${documento.ruta_archivo}`;
    
    // Abrir en nueva ventana/pestaña
    window.open(url, '_blank');
  }

  // Propiedad para controlar la visibilidad del buscador
mostrarBuscador = false;

// Método para toggle del buscador
toggleBuscador() {
  this.mostrarBuscador = !this.mostrarBuscador;
}

}