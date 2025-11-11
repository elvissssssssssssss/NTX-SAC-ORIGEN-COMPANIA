import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComprobanteRequest, ComprobanteResponse } from '../models/comprobante.model';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Comprobantes';

  constructor(private http: HttpClient) {}

  emitirComprobante(data: ComprobanteRequest): Observable<ComprobanteResponse> {
    return this.http.post<ComprobanteResponse>(`${this.apiUrl}/emitir`, data);
  }
}
