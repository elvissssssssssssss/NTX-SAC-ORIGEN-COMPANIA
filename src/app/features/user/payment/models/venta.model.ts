// src/app/features/user/pedido/models/venta.model.ts
// 🟢 Para registrar venta (POST)

// src/app/features/user/pedido/models/venta.model.ts
// 🟢 Para registrar venta (POST)

// src/app/features/user/pedido/models/venta.model.ts

// ✅ Para registrar una venta con detalles (POST /api/Ventas/completa)
export interface VentaDetalleRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaCompletaRequest {
  userId: number;
  metodoPagoId: number;
  total: number;
  detalles: VentaDetalleRequest[];
}

// ✅ Para registrar una venta simple (POST /api/Ventas)
export interface VentaRequest {
  userId: number;
  metodoPagoId: number;
  total: number;
}

// ✅ Para generar preferencia de pago (POST /api/Ventas/preferencia)
export interface PreferenciaItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface PreferenciaRequest {
  items: PreferenciaItem[];
}

// ✅ Para mostrar una venta (GET /api/Ventas)
export interface VentaDetalleResponse {
  productoId: number;
  nombreProducto: string;     // 🆕 Nombre del producto
  cantidad: number;
  precio: number;             // 🧾 Precio total por producto o unitario
}

export interface VentaResponse {
  id: number;
  userId: number;
  usuarioEmail: string;       // 🆕 Email del usuario
  metodoPagoId: number;
  metodoPagoNombre: string;   // 🆕 Nombre del método de pago
  total: number;
  fechaVenta: string;
  detalles: VentaDetalleResponse[];
    estadoVoucher?: string;
  voucherArchivo?: string;
}
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
  usuarioEmail: string;       // Email del usuario
  usuarioNombre?: string;     // ✅ Nombre completo del usuario
  userId: number;
   initPoint?: string;           // ✅ Para MercadoPago
  metodoPagoId: number;
  metodoPagoNombre: string;
  total: number;
  fechaVenta: string;
  detalles: VentaDetalleResponse[];
  envio?: EnvioInfo;  // ✅ Información de envío (opcional)
}
// 🆕 Agregar al final del archivo:

// Respuesta del backend al subir voucher
export interface VoucherResponse {
  success: boolean;
  message: string;
  ventaId: number;
  orderId: number;
  usuarioEmail: string;
}

// Request para subir voucher (opcional, por si quieres tipar el FormData)
export interface VoucherRequest {
  voucher: File;
  userId: number;
  total: number;
  numeroOperacion?: string;
  clienteNombres: string;
  clienteApellidos: string;
  clienteDNI?: string;
  tipoComprobante: string;
  ruc?: string;
  razonSocial?: string;
  detalles: string; // JSON string
}