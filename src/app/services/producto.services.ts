
//src/app/services/producto.services.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataHttp, Product } from '../core/models/product.model';
import { Data } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ProductoServices {

  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Productos';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  constructor(private http: HttpClient) { }


  getProducts(): Observable<DataHttp> {

    return this.http.get<DataHttp>(this.apiUrl);

    // return this.http.get<any>(this.apiUrl).pipe(
    //   map(response => response.data)  // ⬅️ Extrae solo los productos
    // );
  }
// producto.services.ts
deleteProduct(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}


    // CORREGIDO: Para FormData no se debe especificar Content-Type
  createProduct(formData: FormData): Observable<any> {
    // Angular automáticamente detecta FormData y configura los headers correctos
    return this.http.post(this.apiUrl, formData);
  }
  updateProduct(id: string, formData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, formData);
}

getProductosPorCategoria(categoria: string): Observable<DataHttp> {
  return this.http.get<DataHttp>(`${this.apiUrl}/categoria/${categoria}`);
}
getProductoPorId(id: number): Observable<Product> {
  return this.http.get<{ data: Product }>(`${this.apiUrl}/${id}`)
    .pipe(
      map(response => response.data)
    );
}

searchProducts(query: string): Observable<Product[]> {
  return this.http.get<{ data: Product[] }>(`${this.apiUrl}?search=${query}`)
    .pipe(map(response => response.data));
}
// En producto.services.ts, agrega este método:
toggleProductStatus(id: number, estado: boolean): Observable<any> {
  // Crear FormData para enviar solo el campo que necesitamos actualizar
  const formData = new FormData();
  formData.append('estado', estado.toString());
  
  return this.http.patch(`${this.apiUrl}/${id}/estado`, formData);
}

}
