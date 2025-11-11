// src/app/features/user/cart/services/cart.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem, CartResponse } from '../models/cart.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Cart';

  constructor(private http: HttpClient) {}

  agregarAlCarrito(item: CartItem): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  obtenerCarritoPorUsuario(userId: number): Observable<CartResponse> {
  // ✅ Correcta
return this.http.get<CartResponse>(`${this.apiUrl}/${userId}`);

}


  vaciarCarrito(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${userId}`);
  }
  actualizarCantidadItem(cartItemId: number, nuevaCantidad: number) {
  return this.http.put(`${this.apiUrl}/${cartItemId}`, {
    quantity: nuevaCantidad
  });
  
}


eliminarItemDelCarrito(cartItemId: number, userId: number) {
  return this.http.delete(`${this.apiUrl}/${cartItemId}/user/${userId}`);
}

  // 🔄 Método para limpiar el carrito del usuario
  limpiarCarrito(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${userId}`);
  }

}
