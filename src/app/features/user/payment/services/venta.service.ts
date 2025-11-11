  // user/venta/services/venta.service.ts
  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { VentaCompletaRequest, VentaResponse } from '../models/venta.model';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root',
  })
  export class VentaService {
    private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Ventas';

    constructor(private http: HttpClient) {}

   
  // 🟢 POST: Registrar venta completa
  registrarVentaCompleta(venta: VentaCompletaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/completa`, venta);
  }

  // 🟢 GET: Obtener todas las ventas (para administrador o usuario autorizado)
  obtenerVentas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.apiUrl);
  }

  // 🟢 GET: Obtener venta por ID
  obtenerVentaPorId(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.apiUrl}/${id}`);
  }

  // 🟢 Opcional: Obtener ventas por usuario (según login actual)
  obtenerVentasPorUsuario(userId: number): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/usuario/${userId}`);
  }
  // 🟢 POST: Crear preferencia de pago en Mercado Pago
crearPreferenciaPago(items: any[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/preferencia`, { items });
}

}
