import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Envios } from '../models/envio.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EnvioService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/TblEnvios';

  constructor(private http: HttpClient) {}

  guardarEnvio(envio: Envios): Observable<Envios> {
    return this.http.post<Envios>(this.apiUrl, envio);
  }
}
