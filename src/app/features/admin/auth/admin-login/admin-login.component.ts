

import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Component, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loginError = '';
  isLoading = false;
  private particles: HTMLElement[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    // Inicializar formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    this.createParticles();
  }

  ngOnDestroy(): void {
    // Eliminar partículas al salir del componente
    this.particles.forEach(p => p.remove());
  }

  // 🧠 Lógica principal de login
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.createConfetti();
            setTimeout(() => this.router.navigate(['/admin/dashboard']), 1200);
          } else {
            this.loginError = 'Credenciales incorrectas o usuario inactivo.';
          }
        },
        error: (err) => {
          console.error('Error al iniciar sesión:', err);
          this.isLoading = false;
          this.loginError = 'No se pudo conectar con el servidor.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // 🌌 Efecto partículas flotantes
  private createParticles(): void {
    const count = 25;
    const container = this.el.nativeElement.ownerDocument.body;

    for (let i = 0; i < count; i++) {
      const particle = this.renderer.createElement('div');
      this.renderer.addClass(particle, 'particle');

      const size = Math.random() * 2 + 1;
      this.renderer.setStyle(particle, 'width', `${size}px`);
      this.renderer.setStyle(particle, 'height', `${size}px`);
      this.renderer.setStyle(particle, 'position', 'absolute');
      this.renderer.setStyle(particle, 'left', `${Math.random() * 100}vw`);
      this.renderer.setStyle(particle, 'top', `${Math.random() * 100}vh`);
      this.renderer.setStyle(particle, 'background', 'rgba(255,255,255,0.5)');
      this.renderer.setStyle(particle, 'border-radius', '50%');
      this.renderer.setStyle(particle, 'opacity', Math.random() * 0.5 + 0.1);
      this.renderer.setStyle(particle, 'animation', `float ${Math.random() * 20 + 10}s infinite ease-in-out`);
      this.renderer.setStyle(particle, 'animation-delay', `${Math.random() * 5}s`);

      this.renderer.appendChild(container, particle);
      this.particles.push(particle);
    }
  }

  // 🎉 Efecto confeti al iniciar sesión correctamente
  private createConfetti(): void {
    const colors = ['#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#fdcb6e'];
    const count = 50;
    const container = this.el.nativeElement.ownerDocument.body;
    const btn = this.el.nativeElement.querySelector('.login-btn');
    const rect = btn.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const confetti = this.renderer.createElement('div');
      this.renderer.addClass(confetti, 'particle');

      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.renderer.setStyle(confetti, 'width', `${size}px`);
      this.renderer.setStyle(confetti, 'height', `${size}px`);
      this.renderer.setStyle(confetti, 'background-color', color);
      this.renderer.setStyle(confetti, 'position', 'absolute');
      this.renderer.setStyle(confetti, 'left', `${rect.left + rect.width / 2}px`);
      this.renderer.setStyle(confetti, 'top', `${rect.top}px`);
      this.renderer.setStyle(confetti, 'border-radius', '50%');
      this.renderer.setStyle(confetti, 'pointer-events', 'none');
      this.renderer.setStyle(confetti, 'z-index', '1000');

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 5 + 5;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity + 5;

      confetti.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${x}vw, ${y}vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 2000 + 1000,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
      }).onfinish = () => confetti.remove();

      this.renderer.appendChild(container, confetti);
    }
  }
}