////src/app/services/chatbot.service.ts

// src/app/services/chatbot.service.ts
import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private socket!: Socket;

  constructor(private router: Router, private zone: NgZone) {
    //  Cambia la URL por la de tu backend en Render o localhost
  //  this.socket = io('http://localhost:3000', {
     this.socket = io('https://proyecto-wit-ai-websocket-io.onrender.com', {
      transports: ['websocket'],
      reconnection: true,
    });

    //  Escuchar respuestas del bot
    this.socket.on('bot_reply', (msg: any) => {
      console.log('🤖 Mensaje del bot:', msg);
      this.zone.run(() => {
        const event = new CustomEvent('bot-message', { detail: msg });
        window.dispatchEvent(event);
      });
    });

    // Escuchar acciones del bot (por ejemplo, redirección)
    // Escuchar acciones del bot (por ejemplo, redirección)
this.socket.on('bot_action', (action: any) => {
  console.log('⚡ Acción del bot:', action);

  // Solo seguimos si tiene una URL
  if (action?.url) {
    this.zone.run(() => {
      try {
            // Si la URL pertenece a tu dominio, navega internamente
            const base = 'https://ntx-sac-origen-compania-l9jk.vercel.app';
           // const base = 'http://localhost:4200';
           
            const urlObj = new URL(action.url);

            //  Siempre activa el efecto arcoíris, sin importar el tipo
        window.dispatchEvent(
          new CustomEvent('route-highlight', { detail: { duration: 1500 } })
        );

        //  Si es interna → Angular navega
        if (urlObj.origin === base) {
          this.router.navigateByUrl(urlObj.pathname + urlObj.search + urlObj.hash);
        } else {
          // Si es externa → abrir con pequeña espera
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
  }

  sendMessage(text: string, user?: any) {
    this.socket.emit('user_message', {
      text,
      user: user || { id: 0, nombre: 'Visitante' }
    });
  }
}
