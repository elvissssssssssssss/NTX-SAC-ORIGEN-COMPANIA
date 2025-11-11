////src/app/services/envioVoleta.services.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { EstadoEnvio, SeguimientoEnvio, DocumentoEnvio } from '../core/models/envioVoleta';

@Injectable({
  providedIn: 'root'
})
export class EnvioVoletaService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Envios';

  constructor(private http: HttpClient) {}

  // 📍 Obtener estados de envío
  getEstados(): Observable<EstadoEnvio[]> {
    return this.http.get<EstadoEnvio[]>(`${this.apiUrl}/estados`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // 📍 Obtener seguimiento de un envío específico
  getSeguimiento(ventaId: number): Observable<SeguimientoEnvio[]> {
    return this.http.get<SeguimientoEnvio[]>(`${this.apiUrl}/seguimiento/${ventaId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // 📍 Agregar nuevo seguimiento
  addSeguimiento(seguimiento: Partial<SeguimientoEnvio>): Observable<Response> {
    return this.http.post<Response>(`${this.apiUrl}/seguimiento`, seguimiento)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 📍 Obtener documentos de un envío
  getDocumentos(ventaId: number): Observable<DocumentoEnvio[]> {
    return this.http.get<DocumentoEnvio[]>(`${this.apiUrl}/documentos/${ventaId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // 📍 Agregar registro de documento (sin archivo físico)
  addDocumento(documento: Partial<DocumentoEnvio>): Observable<Response> {
    return this.http.post<Response>(`${this.apiUrl}/documentos`, documento)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 📍 Subir archivo de documento
  uploadDocumento(ventaId: number, tipoDocumento: string, archivo: File): Observable<Response> {
    const formData = new FormData();
    formData.append('venta_id', ventaId.toString());
    formData.append('tipo_documento', tipoDocumento);
    formData.append('archivo', archivo);

    return this.http.post<Response>(`${this.apiUrl}/upload-documento`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

 confirmarEntrega(ventaId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/confirmar-entrega/${ventaId}`, null)
    .pipe(
      catchError(this.handleError)
    );
}




  // 🔧 Métodos auxiliares

  // Obtener la URL completa del documento
  getDocumentoUrl(rutaArchivo: string): string {
    // Remover la primera barra si existe para evitar doble barra
    const ruta = rutaArchivo.startsWith('/') ? rutaArchivo.substring(1) : rutaArchivo;
    return `${this.apiUrl.replace('/api/Envios', '')}/${ruta}`;
  }

  // Validar si un archivo es válido para subir
  validarArchivo(archivo: File): { valido: boolean; mensaje?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (archivo.size > maxSize) {
      return { valido: false, mensaje: 'El archivo es muy grande. Máximo 5MB permitido.' };
    }

    if (!tiposPermitidos.includes(archivo.type)) {
      return { valido: false, mensaje: 'Tipo de archivo no permitido. Solo JPG, PNG y PDF.' };
    }

    return { valido: true };
  }

  // Obtener el estado de progreso de un envío (porcentaje)
  getProgresoEnvio(seguimientos: SeguimientoEnvio[]): number {
    if (!seguimientos || seguimientos.length === 0) return 0;

    const ultimoSeguimiento = seguimientos[seguimientos.length - 1];
    const progresoEstados: { [key: number]: number } = {
      1: 16.67, // Confirmado
      2: 33.33, // Empaquetado
      3: 50,    // En Camino
      4: 66.67, // Listo para Recojo
      5: 83.33, // Entregado
      6: 100    // Confirmado por Cliente
    };

    return progresoEstados[ultimoSeguimiento.estado_id] || 0;
  }

  // Obtener el color del estado según el ID
  getColorEstado(estadoId: number): string {
    const colores: { [key: number]: string } = {
      1: '#17a2b8', // Confirmado - info
      2: '#6f42c1', // Empaquetado - purple
      3: '#fd7e14', // En Camino - orange
      4: '#20c997', // Listo para Recojo - teal
      5: '#28a745', // Entregado - success
      6: '#155724'  // Confirmado por Cliente - dark green
    };

    return colores[estadoId] || '#6c757d';
  }

  // Verificar si un estado permite agregar seguimiento
  puedeAgregarSeguimiento(estadoActual: number, nuevoEstado: number): boolean {
    // No se puede retroceder en los estados (excepto casos especiales)
    if (nuevoEstado <= estadoActual && nuevoEstado !== 3) {
      return false;
    }

    // Si ya está confirmado por cliente, no se puede cambiar
    if (estadoActual === 6) {
      return false;
    }

    return true;
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'No disponible';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener el ícono FontAwesome según el tipo de documento
  getIconoDocumento(tipoDocumento: string): string {
    const iconos: { [key: string]: string } = {
      'boleta': 'fas fa-file-invoice',
      'foto_envio': 'fas fa-camera',
      'guia_remision': 'fas fa-truck',
      'comprobante_entrega': 'fas fa-check-circle'
    };

    return iconos[tipoDocumento] || 'fas fa-file';
  }

  // 🚨 Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicie sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }

    console.error('Error en EnvioVoletaService:', error);
    return throwError(() => new Error(errorMessage));
  }

getMisSeguimientos(): Observable<SeguimientoEnvio[]> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  return this.http.get<SeguimientoEnvio[]>(`${this.apiUrl}/mis-seguimientos`, { headers })
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
}

}