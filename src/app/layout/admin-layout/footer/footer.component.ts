import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';
import { Component, OnInit, Input, AfterViewChecked, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminAiChatbotService, ChatMessage } from '../../../services/admin-ai-chatbot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatbotBody') chatbotBody!: ElementRef;
  
  currentUser: User | null = null;
  menus: Menu[] = [];
  @Input() open: boolean = true;

  // Variables del chatbot
  isChatbotVisible = false;
  messageInput = '';
  chatMessages: ChatMessage[] = [];
  isLoading = false;

  messagesSubscription?: Subscription;
  loadingSubscription?: Subscription;
  userSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    public adminAiService: AdminAiChatbotService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.buildMenu();
    });

    // Suscribirse a los mensajes del servicio
    this.messagesSubscription = this.adminAiService.messages$.subscribe((messages) => {
      this.chatMessages = messages;
    });

    // Suscribirse al estado de carga
    this.loadingSubscription = this.adminAiService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  buildMenu(): void {
    if (!this.currentUser) {
      this.menus = [];
      return;
    }

    this.menus = [
      { title: 'Dashboard', route: '/admin/dashboard', icon: 'fa-home' },
      { title: 'Usuarios', route: '/admin/users', icon: 'fa-users' },
      { title: 'Configuración', route: '/admin/settings', icon: 'fa-cog' }
    ];
  }

  // ==========================================
  // FUNCIONES DEL CHATBOT
  // ==========================================

  toggleChatbot() {
    this.isChatbotVisible = !this.isChatbotVisible;
  }

  sendMessage() {
    const msg = this.messageInput.trim();
    if (!msg || this.isLoading) return;

    this.messageInput = '';

    // Obtener nombre del usuario
    const userName = (this.currentUser as any)?.nombre || 
                     (this.currentUser as any)?.username || 
                     (this.currentUser as any)?.email?.split('@')[0] || 
                     'Admin';

    this.adminAiService.sendMessage(msg, {
      id: this.currentUser?.id || 0,
      nombre: userName,
      role: 'admin'
    });
  }

  sendQuickReply(message: string) {
    this.messageInput = message;
    this.sendMessage();
  }

  handleKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.isLoading) {
      this.sendMessage();
    }
  }

  clearChat() {
    this.adminAiService.clearHistory();
  }

  // ==========================================
  // FUNCIONES DE DATOS ADMIN
  // ==========================================

  requestStats() {
    this.adminAiService.requestAdminData('stats', { period: 'today' });
  }

  requestUserInfo() {
    this.adminAiService.requestAdminData('users', { filter: 'active' });
  }

  requestSalesMetrics() {
    this.adminAiService.requestAdminData('sales', { period: 'today' });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

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

  isConnected(): boolean {
    return this.adminAiService.isConnected();
  }

  reconnect() {
    this.adminAiService.reconnect();
  }
}

interface Menu {
  title: string;
  route?: string;
  icon?: string;
}
