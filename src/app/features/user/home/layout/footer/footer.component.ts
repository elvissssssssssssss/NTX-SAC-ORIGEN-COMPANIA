import {
  Component,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../../../../app/services/chatbot.service';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements  AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('chatbotBody') private chatbotBody!: ElementRef;
  isChatbotVisible = false;
  messageInput = '';

  // 🔹 Control de animación arcoíris
  private removeGlowListener?: () => void;
  private hideTimer: any;

  constructor(
    private chatbotService: ChatbotService,
    private renderer: Renderer2
  ) {}

  // ========================
  // 🔹 Ciclo de vida
  // ========================
  ngOnInit() {
    // Escuchar mensajes del bot
    window.addEventListener('bot-message', (event: any) => {
      const msg = event.detail;
      if (msg?.text) {
        this.addMessage(msg.text, 'bot');
      }
    });

    // Escuchar evento para la animación de borde
    this.setupRouteGlowListener();
  }

  ngOnDestroy() {
    window.removeEventListener('bot-message', () => {});
    if (this.removeGlowListener) this.removeGlowListener();
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // ========================
  // 🔹 Chatbot funciones
  // ========================
  toggleChatbot() {
    this.isChatbotVisible = !this.isChatbotVisible;
  }

sendMessage() {
  const msg = this.messageInput.trim();
  if (!msg) return;

  this.addMessage(msg, 'user');
  this.messageInput = '';

  // Llama al servicio — no maneja socket directo
  this.chatbotService.sendMessage(msg);
}

  sendQuickReply(message: string) {
    this.addMessage(message, 'user');
    this.chatbotService.sendMessage(message);
  }

  addMessage(text: string, sender: 'user' | 'bot') {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

    const timeString = this.getCurrentTime();
    messageElement.innerHTML = `
      ${text}
      <div class="message-time">${timeString}</div>
    `;

    if (this.chatbotBody?.nativeElement) {
      this.chatbotBody.nativeElement.appendChild(messageElement);
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  scrollToBottom() {
    try {
      if (this.chatbotBody?.nativeElement) {
        this.chatbotBody.nativeElement.scrollTop = this.chatbotBody.nativeElement.scrollHeight;
      }
    } catch {}
  }

  handleKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') this.sendMessage();
  }

  // ========================
  // 🔹 ANIMACIÓN ARCOÍRIS ()
  // ========================
setupRouteGlowListener() {
  const handler = (ev: Event) => {
    console.log(' Evento route-highlight detectado');

    // Dura exactamente 1.5 s (1500 ms)
    const duration = 2000;
    const el = document.getElementById('routeGlow');

    if (!el) {
      console.warn(' No se encontró #routeGlow en el DOM');
      return;
    }

    // Mostrar el borde
    el.classList.add('show');

    // Si ya hay un temporizador corriendo, cancelarlo
    if (this.hideTimer) clearTimeout(this.hideTimer);

    // Ocultar el borde después del tiempo indicado
    this.hideTimer = setTimeout(() => {
      el.classList.remove('show');
    }, duration);
  };

  // Escuchar el evento global emitido por ChatbotService
  this.removeGlowListener = this.renderer.listen('window', 'route-highlight', handler);
}

}
