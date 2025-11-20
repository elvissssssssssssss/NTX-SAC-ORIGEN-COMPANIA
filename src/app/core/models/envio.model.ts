// src/app/features/user/models/envio.model.ts
// src/app/features/user/payment/models/venta.model.ts

export interface VentaDetalleResponse {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precio: number;
}

// ✅ Modelo para información de envío
export interface EnvioInfo {
  id: number;
  userId: number;
  direccion: string;
  region: string;
  provincia: string;
  localidad: string;
  dni: string;
  telefono: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Modelo de respuesta de venta CON envío
export interface VentaResponse {
  id: number;
  userId: number;
  usuarioEmail: string;
  metodoPagoId: number;
  metodoPagoNombre: string;
  total: number;
  fechaVenta: string;
  detalles: VentaDetalleResponse[];
  envio?: EnvioInfo;  // ✅ Información de envío (opcional)
}
