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
}