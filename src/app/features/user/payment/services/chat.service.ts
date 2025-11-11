import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Pusher, { Channel } from 'pusher-js';
import { Observable, Subject, map } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
  message?: string;
  error?: string;
}

export interface AtencionClienteDto {
  userId?: number;
  nombre: string;
  telefono: string;
  correo: string;
  mensaje: string;
}

export interface ChatMessageDto {
  usuario: string;
  texto: string;
  tipo: 'cliente' | 'admin' | 'sistema';
  fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'https://pusher-backend-elvis.onrender.com/api/Chat';

  private pusher!: Pusher;
  private channel!: Channel;
  private mensajesSubject = new Subject<any>();

  constructor(private http: HttpClient, private zone: NgZone) {
    this.pusher = new Pusher('058be5b82a25fa9d45d6', {
      cluster: 'mt1',
      forceTLS: true
    });
    this.channel = this.pusher.subscribe('chat-soporte');
    this.channel.bind('nuevo-mensaje', (data: any) => {
      this.zone.run(() => this.mensajesSubject.next(data));
    });
  }

  // ---- Contacto / atención
  enviarMensajeContacto(datos: AtencionClienteDto) {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/contacto`, datos);
  }
  obtenerMensajes() {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/mensajes`)
      .pipe(map(r => r.data ?? []));
  }
  obtenerMensajesPorEstado(estado: string) {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/mensajes/estado/${estado}`)
      .pipe(map(r => r.data ?? []));
  }
  actualizarEstado(id: number, estado: string) {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/mensajes/${id}/estado`, { estado });
  }

  // ---- Chat
  obtenerHistorialChat(atencionId: number) {
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/historial/${atencionId}`)
      .pipe(map(r => r.data));
  }
  obtenerHistorialUsuario(userId: number) {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/historial/usuario/${userId}`);
  }
  enviarYGuardarMensaje(
    atencionId: number,
    usuario: string,
    texto: string,
    tipo: 'cliente' | 'admin' | 'sistema'
  ) {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/enviar-y-guardar`, { atencionId, usuario, texto, tipo })
      .pipe(map(r => r.data));
  }
  escucharMensajes(): Observable<any> {
    return this.mensajesSubject.asObservable();
  }
  
  marcarMensajesLeidos(atencionId: number, emisorTipo: string) {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/marcar-leidos/${atencionId}/${emisorTipo}`, {});
  }
  desconectar() {
    if (this.channel) this.channel.unbind_all();
    if (this.pusher) {
      this.pusher.unsubscribe('chat-soporte');
      this.pusher.disconnect();
    }
  }
}
