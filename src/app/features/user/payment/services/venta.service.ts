// src/app/features/user/payment/services/venta.service.ts
import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { 
  VentaCompletaRequest, 
  VentaResponse, 
  EnvioInfo,
  VoucherResponse // 🆕 Importar
} from '../models/venta.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class VentaService {
 private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Ventas';

  private enviosApiUrl = 'https://pusher-backend-elvis.onrender.com/api/TblEnvios';
  private usersApiUrl = 'https://pusher-backend-elvis.onrender.com/api/Auth/user';


  constructor(private http: HttpClient) {}

  // 🟢 POST: Registrar venta completa
   // 🟢 POST: Registrar venta completa (esto dispara el email automático)
  registrarVentaCompleta(venta: VentaCompletaRequest): Observable<any> {
    console.log('📤 Enviando venta al backend:', venta);
    return this.http.post(`${this.apiUrl}/completa`, venta);
  }

  // 🟢 GET: Obtener todas las ventas CON información de envío Y usuario
  obtenerVentas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.apiUrl).pipe(
      switchMap(ventas => {
        // Si no hay ventas, retornar array vacío
        if (!ventas || ventas.length === 0) {
          return of([]);
        }

        // Crear array de observables para obtener datos de usuario y envío
        const ventasCompletas = ventas.map(venta => 
          forkJoin({
            usuario: this.http.get<any>(`${this.usersApiUrl}/${venta.userId}`).pipe(
              catchError(() => of(null))
            ),
            envio: this.http.get<EnvioInfo>(`${this.enviosApiUrl}/user/${venta.userId}`).pipe(
              catchError(() => of(null))
            )
          }).pipe(
            map(({ usuario, envio }) => ({
              ...venta,
              usuarioEmail: usuario?.email || 'Sin email',
              usuarioNombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sin nombre',
              envio: envio || undefined
            }))
          )
        );

        // Ejecutar todas las peticiones en paralelo
        return forkJoin(ventasCompletas);
      }),
      catchError(error => {
        console.error('Error al obtener ventas:', error);
        return of([]);
      })
    );
  }

  // 🟢 GET: Obtener venta por ID con envío y usuario
  obtenerVentaPorId(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.apiUrl}/${id}`).pipe(
      switchMap(venta => 
        forkJoin({
          usuario: this.http.get<any>(`${this.usersApiUrl}/${venta.userId}`).pipe(
            catchError(() => of(null))
          ),
          envio: this.http.get<EnvioInfo>(`${this.enviosApiUrl}/user/${venta.userId}`).pipe(
            catchError(() => of(null))
          )
        }).pipe(
          map(({ usuario, envio }) => ({
            ...venta,
            usuarioEmail: usuario?.email || 'Sin email',
            usuarioNombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sin nombre',
            envio: envio || undefined
          }))
        )
      )
    );
  }

  // 🟢 GET: Obtener ventas por usuario
  obtenerVentasPorUsuario(userId: number): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/usuario/${userId}`);
  }

  // 🟢 POST: Crear preferencia de pago en Mercado Pago
  crearPreferenciaPago(items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/preferencia`, { items });
  }
  // 🟢 POST: Notificar comprobante con PDF
notificarComprobante(ventaId: number): Observable<any> {
  console.log('📧 Notificando comprobante para venta:', ventaId);
  return this.http.post(`${this.apiUrl}/notificar-comprobante`, { ventaId });
}
  // 🆕 Nuevo método para subir voucher
 // 🆕 ACTUALIZADO: Tipar la respuesta
subirVoucherYRegistrarVenta(formData: FormData): Observable<VoucherResponse> {
  return this.http.post<VoucherResponse>(`${this.apiUrl}/pago/voucher-completo`, formData);
}

verificarVoucher(ventaId: number) {
  return this.http.post(
    `https://pusher-backend-elvis.onrender.com/api/Ventas/pago/ventas/${ventaId}/voucher/verificar`,
    {}
  );
}
rechazarVoucher(ventaId: number, observacion: string) {
  return this.http.post(
    `${this.apiUrl}/pago/ventas/${ventaId}/voucher/rechazar`,
    { observacion } // JSON: { "observacion": "motivo..." }
  );
}



}
