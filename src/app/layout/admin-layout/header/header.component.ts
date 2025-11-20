// src/app/layout/header/header.component.ts
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service'; // ajusta la ruta si es necesario

import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Suscribirse al observable del usuario actual
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  // ✅ Método para cerrar sesión
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
  toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
