// src/app/core/models/envioVoleta.ts

export interface EstadoEnvio {
  id: number;
  nombre: string;
  descripcion: string;
  creado_en: string;
  actualizado_en: string;
}

export interface SeguimientoEnvio {
  id?: number;
  venta_id: number;
  estado_id: number;
  ubicacion_actual: string;
  observaciones: string;
  fecha_cambio?: string;
  confirmado_por_cliente?: boolean;
  fecha_confirmacion?: string | null;
  estado_nombre?: string;
  estado_descripcion?: string;
}

export interface DocumentoEnvio {
  id?: number;
  venta_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  fecha_subida?: string;
}

export interface ApiResponse {
  message: string;
  ruta?: string;
}


// Tipos adicionales para mejor tipado
export type TipoDocumento = 'boleta' | 'foto_envio' | 'guia_remision' | 'comprobante_entrega';

export type EstadoEnvioId = 1 | 2 | 3 | 4 | 5 | 6;

export interface EstadoEnvioInfo {
  id: EstadoEnvioId;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  progreso: number;
}

// Constantes para los estados
export const ESTADOS_ENVIO: Record<EstadoEnvioId, EstadoEnvioInfo> = {
  1: {
    id: 1,
    nombre: 'Confirmado',
    descripcion: 'Pedido confirmado y en preparación',
    color: '#17a2b8',
    icono: 'fas fa-check-circle',
    progreso: 16.67
  },
  2: {
    id: 2,
    nombre: 'Empaquetado',
    descripcion: 'Productos empaquetados y listos para envío',
    color: '#6f42c1',
    icono: 'fas fa-box',
    progreso: 33.33
  },
  3: {
    id: 3,
    nombre: 'En Camino',
    descripcion: 'Pedido en tránsito hacia su destino',
    color: '#fd7e14',
    icono: 'fas fa-truck',
    progreso: 50
  },
  4: {
    id: 4,
    nombre: 'Listo para Recojo',
    descripcion: 'Pedido disponible para recoger en agencia',
    color: '#20c997',
    icono: 'fas fa-store',
    progreso: 66.67
  },
  5: {
    id: 5,
    nombre: 'Entregado',
    descripcion: 'Pedido entregado al cliente',
    color: '#28a745',
    icono: 'fas fa-check-double',
    progreso: 83.33
  },
  6: {
    id: 6,
    nombre: 'Confirmado por Cliente',
    descripcion: 'Entrega verificada por el comprador',
    color: '#155724',
    icono: 'fas fa-user-check',
    progreso: 100
  }
};

// Tipos de documento con información adicional
export const TIPOS_DOCUMENTO: Record<TipoDocumento, { label: string; icono: string; extension: string[] }> = {
  'boleta': {
    label: 'Boleta',
    icono: 'fas fa-file-invoice',
    extension: ['.pdf']
  },
  'foto_envio': {
    label: 'Foto del Envío',
    icono: 'fas fa-camera',
    extension: ['.jpg', '.jpeg', '.png']
  },
  'guia_remision': {
    label: 'Guía de Remisión',
    icono: 'fas fa-truck',
    extension: ['.pdf']
  },
  'comprobante_entrega': {
    label: 'Comprobante de Entrega',
    icono: 'fas fa-check-circle',
    extension: ['.pdf', '.jpg', '.jpeg', '.png']
  }
};