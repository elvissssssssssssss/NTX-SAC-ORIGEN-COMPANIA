// src/app/features/admin/envios/envios.component.ts

// src/app/features/admin/envios/envios.component.ts
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { EnvioVoletaService } from '../../../services/envioVoleta.services';
import { EstadoEnvio, SeguimientoEnvio, DocumentoEnvio } from '../../../core/models/envioVoleta';






@Component({
  selector: 'app-envios',
    standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './envios.component.html',
  styleUrl: './envios.component.css'
})






export class Envioscomponent implements OnInit {
  // Formularios
busquedaForm!: FormGroup;
seguimientoForm!: FormGroup;
documentoForm!: FormGroup;

  // Datos
  estados: EstadoEnvio[] = [];
  seguimientos: SeguimientoEnvio[] = [];
  documentos: DocumentoEnvio[] = [];
  
  // Estado de la interfaz
  ventaSeleccionada: number | null = null;
  archivoSeleccionado: File | null = null;
  
  // Flags de carga
  cargando = false;
  enviandoSeguimiento = false;
  subiendoDocumento = false;
  confirmandoEntrega = false;
  
  // Mensajes
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'warning' = 'success';
 
  constructor(
    private fb: FormBuilder,
    private envioService: EnvioVoletaService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.cargarEstados();
  }

  private initForms(): void {
    this.busquedaForm = this.fb.group({
      ventaId: ['', [Validators.required, Validators.min(1)]]
    });

    this.seguimientoForm = this.fb.group({
      estado_id: ['', Validators.required],
      ubicacion_actual: ['', Validators.required],
      observaciones: ['']
    });

    this.documentoForm = this.fb.group({
      tipo_documento: ['', Validators.required]
    });
  }

  private cargarEstados(): void {
    this.envioService.getEstados().subscribe({
      next: (estados) => {
        this.estados = estados;
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
        this.mostrarMensaje('Error al cargar los estados', 'error');
      }
    });
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

  agregarSeguimiento(): void {
    if (this.seguimientoForm.invalid || !this.ventaSeleccionada) return;
    
    this.enviandoSeguimiento = true;
    
    const nuevoSeguimiento: Partial<SeguimientoEnvio> = {
      venta_id: this.ventaSeleccionada,
      ...this.seguimientoForm.value
    };

    this.envioService.addSeguimiento(nuevoSeguimiento).subscribe({
      next: (response) => {
        this.mostrarMensaje('Seguimiento agregado correctamente', 'success');
        this.seguimientoForm.reset();
        this.cargarSeguimientos(this.ventaSeleccionada!);
      },
      error: (error) => {
        console.error('Error al agregar seguimiento:', error);
        this.mostrarMensaje('Error al agregar el seguimiento', 'error');
      },
      complete: () => {
        this.enviandoSeguimiento = false;
      }
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      
      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (this.archivoSeleccionado.size > maxSize) {
        this.mostrarMensaje('El archivo es muy grande. Máximo 5MB', 'error');
        this.archivoSeleccionado = null;
        input.value = '';
      }
    }
  }

  subirDocumento(): void {
    if (this.documentoForm.invalid || !this.archivoSeleccionado || !this.ventaSeleccionada) return;
    
    this.subiendoDocumento = true;
    
    const tipoDocumento = this.documentoForm.value.tipo_documento;
    
    this.envioService.uploadDocumento(
      this.ventaSeleccionada, 
      tipoDocumento, 
      this.archivoSeleccionado
    ).subscribe({
      next: (response) => {
        this.mostrarMensaje('Documento subido correctamente', 'success');
        this.documentoForm.reset();
        this.archivoSeleccionado = null;
        
        // Limpiar el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Colapsar el formulario
        const collapse = document.getElementById('subirDocumento');
        if (collapse) {
          const bsCollapse = new (window as any).bootstrap.Collapse(collapse);
          bsCollapse.hide();
        }
        
        this.cargarDocumentos(this.ventaSeleccionada!);
      },
      error: (error) => {
        console.error('Error al subir documento:', error);
        this.mostrarMensaje('Error al subir el documento', 'error');
      },
      complete: () => {
        this.subiendoDocumento = false;
      }
    });
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

  puedeConfirmarEntrega(): boolean {
    if (this.seguimientos.length === 0) return false;
    
    const ultimoSeguimiento = this.seguimientos[this.seguimientos.length - 1];
    
    // Puede confirmar si el último estado es "Listo para Recojo" (id: 4) o "En Camino" (id: 3)
    // y no está confirmado por el cliente
    return (ultimoSeguimiento.estado_id === 3 || ultimoSeguimiento.estado_id === 4) && 
           !ultimoSeguimiento.confirmado_por_cliente;
  }

  descargarDocumento(documento: DocumentoEnvio): void {
    // Construir la URL completa del documento
    const url = `http://localhost:5295${documento.ruta_archivo}`;
    
    // Abrir en nueva ventana/pestaña
    window.open(url, '_blank');
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

  private mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'warning'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.cerrarMensaje();
    }, 5000);
  }

  cerrarMensaje(): void {
    this.mensaje = '';
  }
}
