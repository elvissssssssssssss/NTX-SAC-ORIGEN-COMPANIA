// src/app/services/admin-ai-chatbot.service.ts

import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAiChatbotService {
  private socket!: Socket;
  private conversationHistory: ChatMessage[] = [];
  
  // Subject para emitir mensajes a los componentes
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  // Subject para estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private router: Router, private zone: NgZone) {
    // Conectar al mismo backend que usas para usuarios
  //  this.socket = io('http://localhost:3000', {
  this.socket = io('https://proyecto-wit-ai-websocket-io.onrender.com', {
        //
      transports: ['websocket'],
      reconnection: true,
      query: {
        context: 'admin' // Identificar que es un admin
      }
    });

    this.setupListeners();
    this.initializeConversation();
  }

  private setupListeners() {
    // Cuando se conecta al servidor
    this.socket.on('connect', () => {
      console.log('🟢 Admin Chatbot conectado al servidor');
      // Unirse a la sala de admin
      this.socket.emit('join_room', { room: 'admin' });
    });

    // Escuchar respuestas del bot específicas para admin
    this.socket.on('bot_reply', (msg: any) => {
      console.log('🤖 Respuesta del bot (Admin):', msg);
      this.zone.run(() => {
        this.loadingSubject.next(false);
        
        if (msg?.text) {
          this.addAssistantMessage(msg.text);
        }
      });
    });

    // Escuchar respuestas específicas de admin (si el backend las envía)
    this.socket.on('admin_bot_reply', (msg: any) => {
      console.log('🤖 Respuesta específica de admin:', msg);
      this.zone.run(() => {
        this.loadingSubject.next(false);
        
        if (msg?.text) {
          this.addAssistantMessage(msg.text);
        }
      });
    });

    // Escuchar acciones del bot (redirecciones, etc.)
    this.socket.on('bot_action', (action: any) => {
      console.log('⚡ Acción del bot (Admin):', action);

      if (action?.url) {
        this.zone.run(() => {
          try {
            const base = 'https://ntx-sac-origen-compania-l9jk.vercel.app';
            // const base = 'http://localhost:4200';
            
            const urlObj = new URL(action.url);

            // Activar efecto arcoíris
            window.dispatchEvent(
              new CustomEvent('route-highlight', { detail: { duration: 1500 } })
            );

            // Navegación interna o externa
            if (urlObj.origin === base) {
              this.router.navigateByUrl(urlObj.pathname + urlObj.search + urlObj.hash);
            } else {
              setTimeout(() => {
                window.location.href = action.url;
              }, 400);
            }
          } catch (err) {
            console.error('❌ Error al procesar redirección:', err);
            window.location.href = action.url;
          }

          setTimeout(() => {
            const el = document.getElementById('routeGlow');
            if (el) el.classList.remove('show');
          }, 1000);
        });
      }
    });

    // Escuchar datos/estadísticas específicas de admin
    this.socket.on('admin_stats', (stats: any) => {
      console.log('📊 Estadísticas recibidas:', stats);
      this.zone.run(() => {
        // Formatear las estadísticas como mensaje del bot
        const statsMessage = this.formatStatsMessage(stats);
        this.addAssistantMessage(statsMessage);
      });
    });

    // Manejo de errores
    this.socket.on('error', (error: any) => {
      console.error('❌ Error en socket:', error);
      this.zone.run(() => {
        this.loadingSubject.next(false);
        this.addAssistantMessage('❌ Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
      });
    });

    // Desconexión
    this.socket.on('disconnect', () => {
      console.log('🔴 Admin Chatbot desconectado del servidor');
    });
  }

  private initializeConversation() {
    // Mensaje de sistema inicial
    const systemMsg: ChatMessage = {
      role: 'system',
      content: 'Eres un asistente virtual especializado para administradores. Ayudas con gestión de usuarios, análisis de datos, configuración del sistema y soporte técnico avanzado.',
      timestamp: new Date()
    };
    this.conversationHistory.push(systemMsg);

    // Mensaje de bienvenida
    const welcomeMsg: ChatMessage = {
      role: 'assistant',
      content: '¡Hola Administrador! 🤖 Soy tu asistente de IA. Puedo ayudarte con:\n\n• 📊 Estadísticas y métricas del sistema\n• 👥 Gestión de usuarios\n• ⚙️ Configuración avanzada\n• 📈 Análisis de datos\n• 🔧 Soporte técnico\n\n¿En qué puedo asistirte hoy?',
      timestamp: new Date()
    };
    this.conversationHistory.push(welcomeMsg);
    this.messagesSubject.next([...this.conversationHistory]);
  }

  /**
   * Envía un mensaje del usuario al servidor
   */
  sendMessage(text: string, user?: any) {
    if (!text.trim()) return;

    // Agregar mensaje del usuario al historial
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    this.conversationHistory.push(userMsg);
    this.messagesSubject.next([...this.conversationHistory]);
    this.loadingSubject.next(true);

    // Enviar al servidor con contexto de admin
    this.socket.emit('user_message', {
      text: text,
      user: user || { id: 0, nombre: 'Admin', role: 'admin' },
      context: 'admin',
      room: 'admin',
      history: this.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    console.log('📤 Mensaje enviado desde Admin:', text);
  }

  /**
   * Envía una solicitud específica de admin (estadísticas, reportes, etc.)
   */
  requestAdminData(dataType: string, params?: any) {
    this.loadingSubject.next(true);
    
    this.socket.emit('admin_request', {
      type: dataType,
      params: params,
      timestamp: new Date()
    });

    console.log('📊 Solicitud de datos admin:', dataType);
  }

  /**
   * Agrega un mensaje del asistente al historial
   */
  private addAssistantMessage(content: string) {
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: content,
      timestamp: new Date()
    };
    
    this.conversationHistory.push(assistantMsg);
    this.messagesSubject.next([...this.conversationHistory]);
  }

  /**
   * Formatea estadísticas en un mensaje legible
   */
  private formatStatsMessage(stats: any): string {
    let message = '📊 **Estadísticas del Sistema**\n\n';
    
    if (stats.users) {
      message += `👥 Usuarios totales: ${stats.users.total}\n`;
      message += `🟢 Usuarios activos: ${stats.users.active}\n`;
      message += `🆕 Nuevos hoy: ${stats.users.newToday}\n\n`;
    }
    
    if (stats.sales) {
      message += `💰 Ventas hoy: $${stats.sales.today}\n`;
      message += `📦 Pedidos: ${stats.sales.orders}\n`;
      message += `📈 Conversión: ${stats.sales.conversion}%\n\n`;
    }
    
    if (stats.system) {
      message += `⚙️ CPU: ${stats.system.cpu}%\n`;
      message += `💾 Memoria: ${stats.system.memory}%\n`;
      message += `🌐 Uptime: ${stats.system.uptime}\n`;
    }
    
    return message;
  }

  /**
   * Limpia el historial de conversación
   */
  clearHistory() {
    const systemMsg = this.conversationHistory.find(msg => msg.role === 'system');
    this.conversationHistory = systemMsg ? [systemMsg] : [];
    
    // Agregar mensaje de reinicio
    const resetMsg: ChatMessage = {
      role: 'assistant',
      content: '💬 Conversación reiniciada. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    };
    
    this.conversationHistory.push(resetMsg);
    this.messagesSubject.next([...this.conversationHistory]);
  }

  /**
   * Obtiene el historial completo
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Verifica si el socket está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Reconecta al servidor
   */
  reconnect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * Desconecta del servidor (cleanup)
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Envía un evento personalizado al servidor
   */
  emitCustomEvent(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  /**
   * Escucha un evento personalizado del servidor
   */
  onCustomEvent(eventName: string, callback: (data: any) => void) {
    this.socket.on(eventName, (data: any) => {
      this.zone.run(() => callback(data));
    });
  }
}
