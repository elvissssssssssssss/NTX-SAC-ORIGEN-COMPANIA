

//import { Component } from '@angular/core';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChatService } from '../../user/payment/services/chat.service';
import { Subscription } from 'rxjs';

interface MensajeDB {
  id: number;
  userId?: number;
  nombre: string;
  telefono: string;
  correo: string;
  mensaje: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}


@Component({
  selector: 'app-clientes',
    standalone: true,
   imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule], 
  templateUrl: './atencionCliente.component.html',
  styleUrl: './atencionCliente.component.css'
})
export class atencionClienteComponent  implements OnInit  {
  @ViewChild('chatMessages') private chatMessages!: ElementRef;

  mensajes: MensajeDB[] = [];
  clientesActivos: any[] = [];
  clienteSeleccionado: any = null;
  mensajesChat: any[] = [];
  nuevoMensajeChat: string = '';
  cargando = false;
  
 historialConversaciones: any[] = [];
conversacionSeleccionada: any = null;
  // 🔍 Filtros
  filtroEstado = 'todos';
  estadosDisponibles = ['todos', 'pendiente', 'leido', 'respondido'];

  private subscripcionMensajes?: Subscription;

  constructor(private chatService: ChatService) {}

  // 🚀 Al iniciar el componente
ngOnInit(): void {
  this.cargarMensajes();
  this.cargarClientesActivos();
  this.iniciarEscuchaMensajesChat();

  // 🔁 Restaurar cliente seleccionado e historial al recargar
  const clienteGuardado = localStorage.getItem('clienteSeleccionado');
  const historialGuardado = localStorage.getItem('mensajesChat');

  if (clienteGuardado && historialGuardado) {
    this.clienteSeleccionado = JSON.parse(clienteGuardado);
    this.mensajesChat = JSON.parse(historialGuardado);
    console.log('♻️ Chat restaurado desde localStorage');
    setTimeout(() => this.scrollToBottom(), 300);
  }
}
ngOnChanges(): void {
  this.guardarEstadoChat();
}

private guardarEstadoChat(): void {
  if (this.clienteSeleccionado) {
    localStorage.setItem('clienteSeleccionado', JSON.stringify(this.clienteSeleccionado));
    localStorage.setItem('mensajesChat', JSON.stringify(this.mensajesChat));
  }
}
// antes: cargarHistorial(userId: number) { this.chatService.getHistorialPorUsuario(...) }
cargarHistorial(userId: number) {
  this.chatService.obtenerHistorialUsuario(userId).subscribe({
    next: (res) => {
      // El endpoint devuelve { success, data } o 404 si no hay historial
      if (res?.success) {
        this.historialConversaciones = Array.isArray(res.data)
          ? res.data
          : (res.data ? [res.data] : []);
      } else {
        this.historialConversaciones = [];
      }
    },
    error: (err) => {
      if (err.status === 404) {
        // Tu API hace NotFound cuando no hay historial
        this.historialConversaciones = [];
        return;
      }
      console.error('Error cargando historial', err);
    }
  });
}



abrirConversacion(conversacion: any) {
  this.conversacionSeleccionada = conversacion;

  // usa atencionId (si no viene, cae a id)
  const atencionId = conversacion.atencionId ?? conversacion.id;

  this.chatService.obtenerHistorialChat(atencionId).subscribe({
    next: (historial: any) => {
      this.mensajesChat = [];

      if (historial?.mensajeOriginal) {
        this.mensajesChat.push({
          texto: historial.mensajeOriginal.mensaje,
          tipo: 'cliente',
          timestamp: new Date(
            historial.mensajeOriginal.createdAt ?? historial.mensajeOriginal.created_at
          )
        });
      }

      (historial?.mensajes ?? []).forEach((msg: any) => {
        this.mensajesChat.push({
          texto: msg.mensaje,
          tipo: msg.emisorTipo,                 // 'admin' | 'cliente'
          timestamp: new Date(msg.createdAt ?? msg.created_at),
          emisorNombre: msg.emisorNombre
        });
      });

      if (this.mensajesChat.length === 0) {
        this.mensajesChat.push({
          texto: `Hola ${historial?.mensajeOriginal?.nombre || 'Cliente'}, ¿en qué puedo ayudarte?`,
          tipo: 'sistema',
          timestamp: new Date()
        });
      }

      this.scrollToBottom();
    },
    error: (err) => {
      console.error('❌ Error al cargar historial de atención:', err);
      this.mensajesChat = [{
        texto: 'No se pudo cargar el historial. Puedes iniciar una nueva conversación.',
        tipo: 'sistema',
        timestamp: new Date()
      }];
    }
  });
}

/**
   * 📋 CARGAR MENSAJES DESDE LA BASE DE DATOS
   */
 cargarMensajes(): void {
  this.cargando = true;

  const obs = this.filtroEstado === 'todos'
    ? this.chatService.obtenerMensajes()
    : this.chatService.obtenerMensajesPorEstado(this.filtroEstado);

  obs.subscribe({
    next: (data) => {
      this.mensajes = data;
    },
    error: (error) => {
      console.error('❌ Error al cargar mensajes:', error);
      alert('Error al cargar los mensajes. Verifica la conexión.');
    },
    complete: () => (this.cargando = false)
  });
}

  /**
   * 🔍 FILTRAR MENSAJES POR ESTADO
   */
  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.cargarMensajes();
  }

  /**
   * 📬 MARCAR MENSAJE COMO LEÍDO
   */
  marcarComoLeido(mensaje: MensajeDB): void {
    if (mensaje.estado === 'pendiente') {
      this.chatService.actualizarEstado(mensaje.id, 'leido').subscribe({
        next: () => {
          mensaje.estado = 'leido';
          console.log('✅ Mensaje marcado como leído');
        },
        error: (error) => console.error('❌ Error al actualizar estado:', error)
      });
    }
  }

  /**
   * 📧 RESPONDER MENSAJE - ABRE CHAT CON HISTORIAL
   */
  responderMensaje(mensaje: MensajeDB): void {
    console.log('🔓 Abriendo chat para responder a:', mensaje.nombre);
    this.abrirChatConCliente(mensaje);
  }

  /**
   * 🔓 ABRIR CHAT CON CLIENTE DESDE MENSAJE DE CONTACTO
   */
  abrirChatConCliente(mensaje: MensajeDB): void {
    const cliente = {
      id: mensaje.id,
      nombre: mensaje.nombre,
      correo: mensaje.correo,
      telefono: mensaje.telefono,
      online: false,
      atencionId: mensaje.id
    };

    // Si no existe el cliente, agregarlo
    const existe = this.clientesActivos.find(c => c.atencionId === cliente.atencionId);
    if (!existe) {
      this.clientesActivos.unshift(cliente);
    } else {
      const index = this.clientesActivos.findIndex(c => c.atencionId === cliente.atencionId);
      this.clientesActivos[index] = cliente;
    }

    // Seleccionar cliente y cargar su historial
    this.clienteSeleccionado = cliente;
    this.mensajesChat = [];
    this.cargarHistorialChat(mensaje.id);

    // Scroll automático
    setTimeout(() => {
      const chatSection = document.querySelector('.chat-admin');
      if (chatSection) chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  /**
   * 📜 CARGAR HISTORIAL DE CHAT DESDE LA BD
   */

// 1) Cargar historial por atención (usa el objeto ya mapeado)
cargarHistorialChat(atencionId: number): void {
  this.chatService.obtenerHistorialChat(atencionId).subscribe({
    next: (historial: any) => {
      this.mensajesChat = [];

      if (historial?.mensajeOriginal) {
        this.mensajesChat.push({
          texto: historial.mensajeOriginal.mensaje,
          tipo: 'cliente',
          timestamp: new Date(historial.mensajeOriginal.createdAt ?? historial.mensajeOriginal.created_at)
        });
      }

      (historial?.mensajes ?? []).forEach((msg: any) => {
        this.mensajesChat.push({
          texto: msg.mensaje,
          tipo: msg.emisorTipo, // 'admin' | 'cliente'
          timestamp: new Date(msg.createdAt ?? msg.created_at),
          emisorNombre: msg.emisorNombre
        });
      });

      if (this.mensajesChat.length === 0) {
        this.mensajesChat.push({
          texto: `Hola ${historial?.mensajeOriginal?.nombre || 'Cliente'}, ¿en qué puedo ayudarte?`,
          tipo: 'sistema',
          timestamp: new Date()
        });
      }

      this.scrollToBottom();
    },
    error: (error) => {
      console.error('❌ Error al cargar historial:', error);
      this.mensajesChat = [{
        texto: 'No se pudo cargar el historial. Puedes iniciar una nueva conversación.',
        tipo: 'sistema',
        timestamp: new Date()
      }];
    }
  });
}
  /**
   * 📤 ENVIAR MENSAJE CHAT COMO ADMIN
   */
enviarMensajeChat(): void {
  if (!this.nuevoMensajeChat.trim() || !this.clienteSeleccionado) return;

  const atencionId = this.clienteSeleccionado.atencionId || this.clienteSeleccionado.id;

  const nuevoMsg = {
    texto: this.nuevoMensajeChat,
    tipo: 'admin',
    timestamp: new Date(),
    emisorNombre: 'Agente Soporte'
  };

  this.mensajesChat.push(nuevoMsg);
  this.guardarEstadoChat(); // 💾 Guardar cada vez que envías

  this.chatService.enviarYGuardarMensaje(
    atencionId,
    'Agente Soporte',
    this.nuevoMensajeChat,
    'admin'
  ).subscribe({
    next: () => console.log('✅ Mensaje guardado y enviado'),
    error: err => console.error('❌ Error al enviar:', err)
  });

  this.nuevoMensajeChat = '';
  this.scrollToBottom();
}

cerrarChat(): void {
  this.clienteSeleccionado = null;
  this.mensajesChat = [];
  localStorage.removeItem('clienteSeleccionado');
  localStorage.removeItem('mensajesChat');
}

  /**
   * 📜 SCROLL AUTOMÁTICO AL FINAL
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessages) {
        this.chatMessages.nativeElement.scrollTop =
          this.chatMessages.nativeElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * 🔌 LIMPIAR SUSCRIPCIONES
   */
  ngOnDestroy(): void {
    this.subscripcionMensajes?.unsubscribe();
  }

  /**
   * 🎨 BADGE DE ESTADO
   */
  getBadgeClass(estado: string): string {
    const badges: Record<string, string> = {
      pendiente: 'badge-warning',
      leido: 'badge-info',
      respondido: 'badge-success'
    };
    return badges[estado] || 'badge-secondary';
  }

  /**
   * 📊 ESTADÍSTICAS
   */
  get totalMensajes(): number {
    return this.mensajes.length;
  }

  get mensajesPendientes(): number {
    return this.mensajes.filter(m => m.estado === 'pendiente').length;
  }

  get mensajesRespondidos(): number {
    return this.mensajes.filter(m => m.estado === 'respondido').length;
  }

  /**
   * 👥 CARGAR CLIENTES ACTIVOS (Placeholder)
   */
  cargarClientesActivos(): void {
    this.clientesActivos = [];
  }

  /**
   * 💬 ESCUCHAR MENSAJES EN TIEMPO REAL (PUSHER)
   */
// 2) Listener de Pusher en admin (lee las claves correctas)
iniciarEscuchaMensajesChat(): void {
  this.subscripcionMensajes = this.chatService.escucharMensajes().subscribe((msg) => {
    // msg: { atencionId, usuario, texto, tipo, fecha }
    if (!this.clienteSeleccionado) return;

    if (msg.tipo === 'cliente' && msg.atencionId === this.clienteSeleccionado.atencionId) {
      this.mensajesChat.push({
        texto: msg.texto,
        tipo: 'cliente',
        timestamp: new Date(msg.fecha),
        emisorNombre: msg.usuario
      });
      this.scrollToBottom();
    }
  });
}}