import {
  Component,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../../../../app/services/chatbot.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  html?: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('chatbotBody') private chatbotBody!: ElementRef;
  
  isChatbotVisible = false;
  messageInput = '';
  messages: ChatMessage[] = [];
  isTyping = false;

  private removeGlowListener?: () => void;
  private hideTimer: any;

  constructor(
    private chatbotService: ChatbotService,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Mensaje de bienvenida inicial
    this.messages.push({
      text: '¡Hola! 👋 Soy tu asistente virtual de **NTX SAC**.\n\n¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: this.getCurrentTime(),
      html: this.formatMessage('¡Hola! 👋 Soy tu asistente virtual de **NTX SAC**.\n\n¿En qué puedo ayudarte hoy?')
    });

    // Escuchar mensajes del bot
    window.addEventListener('bot-message', this.handleBotMessage.bind(this));

    // Escuchar evento para la animación de borde
    this.setupRouteGlowListener();
  }

  ngOnDestroy() {
    window.removeEventListener('bot-message', this.handleBotMessage.bind(this));
    if (this.removeGlowListener) this.removeGlowListener();
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  handleBotMessage(event: any) {
    const msg = event.detail;
    this.isTyping = false;
    
    if (msg?.text) {
      this.messages.push({
        text: msg.text,
        sender: 'bot',
        timestamp: this.getCurrentTime(),
        html: this.formatMessage(msg.text)
      });
    }
  }

  toggleChatbot() {
    this.isChatbotVisible = !this.isChatbotVisible;
  }

  sendMessage() {
    const msg = this.messageInput.trim();
    if (!msg) return;

    // Agregar mensaje del usuario
    this.messages.push({
      text: msg,
      sender: 'user',
      timestamp: this.getCurrentTime()
    });

    this.messageInput = '';
    this.isTyping = true;

    // Enviar al backend
    this.chatbotService.sendMessage(msg);
  }

  sendQuickReply(message: string) {
    this.messages.push({
      text: message,
      sender: 'user',
      timestamp: this.getCurrentTime()
    });
    
    this.isTyping = true;
    this.chatbotService.sendMessage(message);
  }

  /**
   * Formatea el mensaje de Markdown a HTML
   */
  formatMessage(text: string): string {
    let formatted = text;

    // Convertir **texto** a <strong>texto</strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convertir * item a <li>item</li>
    formatted = formatted.replace(/^\s*[•\*]\s+(.+)$/gm, '<li>$1</li>');

    // Envolver <li> en <ul> si existen
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }

    // Convertir saltos de línea \n\n a <br>
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
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

  setupRouteGlowListener() {
    const handler = (ev: Event) => {
      console.log('✨ Evento route-highlight detectado');

      const duration = 2000;
      const el = document.getElementById('routeGlow');

      if (!el) {
        console.warn('⚠️ No se encontró #routeGlow en el DOM');
        return;
      }

      el.classList.add('show');

      if (this.hideTimer) clearTimeout(this.hideTimer);

      this.hideTimer = setTimeout(() => {
        el.classList.remove('show');
      }, duration);
    };

    this.removeGlowListener = this.renderer.listen('window', 'route-highlight', handler);
  }
}
