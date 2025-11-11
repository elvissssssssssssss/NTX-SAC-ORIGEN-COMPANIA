import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, AtencionClienteDto } from '../../payment/services/chat.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-hombre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './hombre.component.html',
  styleUrls: ['./hombre.component.css']
})
export class HombreComponent implements OnInit, OnDestroy  {
  contactForm!: FormGroup;
  enviandoMensaje = false;
  cargandoHistorial = false;

  mensajes: any[] = [];
  nuevoMensaje = '';
  atencionId: number | null = null;
  userId: number | null = null;

  private subs: Subscription[] = [];
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  private get myName(): string {
  return this.contactForm?.value?.nombre || 'Usuario';
}

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) this.userId = user.id;

    this.contactForm = this.fb.group({
      nombre: [user?.nombre || '', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
      correo: [user?.email || '', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(5)]]
    });

    const savedChat = localStorage.getItem('chatSession');
    if (savedChat) {
      const data = JSON.parse(savedChat);
      this.atencionId = data.atencionId;
      this.mensajes = data.mensajes || [];
    }

    if (!this.atencionId && this.userId) {
      this.cargarHistorialUsuario(this.userId);
    }

// 2) Reemplaza COMPLETO el bloque de suscripción a Pusher dentro de ngOnInit()
this.subs.push(
  this.chatService.escucharMensajes().subscribe((msg) => {
    // payload Pusher: { atencionId, usuario, texto, tipo, fecha }
    if (!this.atencionId || msg.atencionId !== this.atencionId) return;

    // 🚫 anti-duplicado: si el mensaje que llega por Pusher es mío (cliente),
    // intento reconciliar con el "pendiente" que ya mostré localmente
    if (msg.tipo === 'cliente' && msg.usuario === this.myName) {
      // Busco el último mensaje local pendiente con el mismo texto
      let pendingIndex = -1;
      for (let i = this.mensajes.length - 1; i >= 0; i--) {
        const m = this.mensajes[i];
        if (m.tipo === 'usuario' && m.enviando && m.texto === msg.texto) {
          pendingIndex = i;
          break;
        }
      }
      if (pendingIndex > -1) {
        // Convierto el pendiente en confirmado (no agrego uno nuevo)
        this.mensajes[pendingIndex] = {
          ...this.mensajes[pendingIndex],
          enviando: false,
          remitente: msg.usuario,
          timestamp: msg.fecha ? new Date(msg.fecha) : new Date()
        };
        this.saveChatToLocal();
        this.scrollToBottom();
        return;
      }
    }

    // Si no era "mío" (o no había pendiente), lo agrego normal
    this.mensajes.push({
      texto: msg.texto,
      tipo: msg.tipo === 'admin' ? 'agente' : 'usuario',
      remitente: msg.usuario,
      timestamp: msg.fecha ? new Date(msg.fecha) : new Date()
    });
    this.saveChatToLocal();
    this.scrollToBottom();
  })
);
  }
// 3) Reemplaza COMPLETO el método enviarMensajeChat()






  enviarMensaje() {
    if (this.contactForm.invalid || !this.userId) return;
    this.enviandoMensaje = true;

    const datos: AtencionClienteDto = { ...this.contactForm.value, userId: this.userId };

    this.chatService.enviarMensajeContacto(datos).subscribe({
      next: (res) => {
        this.enviandoMensaje = false;
        if (res.success && res.data?.id) {
          this.atencionId = res.data.id;
          this.mensajes = [{
            texto: datos.mensaje,
            tipo: 'usuario',
            timestamp: new Date(),
            remitente: datos.nombre
          }];
          this.saveChatToLocal();
        }
      },
      error: () => (this.enviandoMensaje = false)
    });
  }

  cargarHistorialUsuario(userId: number) {
    this.cargandoHistorial = true;
    this.chatService.obtenerHistorialUsuario(userId).subscribe({
      next: (res) => {
        this.cargandoHistorial = false;
        if (res.success && res.data) {
          this.atencionId = res.data.mensajeOriginal.id;
          this.mensajes = [];

          const original = res.data.mensajeOriginal;
          this.mensajes.push({
            texto: original.mensaje,
            tipo: 'usuario',
            remitente: original.nombre,
            timestamp: original.createdAt ?? original.created_at
          });

          for (const m of res.data.mensajes) {
            this.mensajes.push({
              texto: m.mensaje,
              tipo: m.emisorTipo === 'admin' ? 'agente' : 'usuario',
              remitente: m.emisorNombre,
              timestamp: m.createdAt ?? m.created_at
            });
          }

          this.saveChatToLocal();
          this.scrollToBottom();
        }
      },
      error: () => (this.cargandoHistorial = false)
    });
  }

  enviarMensajeChat() {
    if (!this.nuevoMensaje.trim() || !this.atencionId) return;

    const texto = this.nuevoMensaje;
    this.nuevoMensaje = '';

    const nuevo = {
      texto,
      tipo: 'usuario',
      timestamp: new Date(),
      enviando: true,
      remitente: 'Tú'
    };
    this.mensajes.push(nuevo);
    this.scrollToBottom();

    // IMPORTANTE: usar enviarYGuardarMensaje (emite Pusher + guarda en DB)
    this.chatService.enviarYGuardarMensaje(
      this.atencionId,
      this.contactForm.value?.nombre || 'Usuario',
      texto,
      'cliente'
    ).subscribe({
      next: () => {
        nuevo.enviando = false;
        this.saveChatToLocal();
      },
      error: () => (nuevo.enviando = false)
    });
  }

  limpiarConversacion() {
    this.mensajes = [];
    this.atencionId = null;
    localStorage.removeItem('chatSession');
    this.contactForm.reset();
  }

  private saveChatToLocal() {
    localStorage.setItem('chatSession', JSON.stringify({
      atencionId: this.atencionId,
      mensajes: this.mensajes
    }));
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatMessages?.nativeElement) {
        this.chatMessages.nativeElement.scrollTop =
          this.chatMessages.nativeElement.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.chatService.desconectar();
  }

  get nombreInvalid() {
    return this.contactForm.get('nombre')?.invalid && this.contactForm.get('nombre')?.touched;
  }
  get telefonoInvalid() {
    return this.contactForm.get('telefono')?.invalid && this.contactForm.get('telefono')?.touched;
  }
  get correoInvalid() {
    return this.contactForm.get('correo')?.invalid && this.contactForm.get('correo')?.touched;
  }
  get mensajeInvalid() {
    return this.contactForm.get('mensaje')?.invalid && this.contactForm.get('mensaje')?.touched;
  }
}
