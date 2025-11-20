// src/app/layout/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Menu } from '../../../core/models/menu.model';
import { AuthService, User } from '../../../core/services/auth.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  menus: Menu[] = [];
 @Input() open: boolean = true;

   
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.buildMenu();
    });
  }

  private buildMenu(): void {
    const rol = this.currentUser?.rol || '';

    // 🔹 Menú base (visible para todos)
    const baseMenu: Menu[] = [
      {
        icon: 'home',
        title: 'Dashboard',
        grupo: 'dashboard',
        children: [{ title: 'Inicio', link: '/admin/dashboard' }]
      }
    ];

    // 🔹 Menú completo (para SuperAdmin)
    const fullMenu: Menu[] = [
      {
        icon: 'gestion',
        title: 'Gestión',
        grupo: 'mantenimiento',
        children: [
          { title: 'Productos', link: '/admin/mantenimiento/producto' },
          { title: 'Clientes', link: '/admin/clientes' }
        ]
      },
      {
        icon: 'ventas',
        title: 'Ventas',
        grupo: 'ventas',
        children: [
          { title: 'Órdenes', link: '/admin/ventas' },
          { title: 'Envíos', link: '/admin/enivioAdmin' }
        ]
      },
      {
        icon: 'users',
        title: 'Roles y Usuarios',
        grupo: 'usuarios',
        children: [
          { title: 'Lista de Roles', link: '/admin/roles' },
          { title: 'Crear Rol', link: '/admin/roles/create' }
        ]
      },
      {
        icon: 'fas fa-headset',
        title: 'Atención al Cliente',
        grupo: 'soporte',
        children: [
          { title: 'Consultas', link: '/admin/atencionClienteadmin' },
          { title: 'Reclamos', link: '/admin/reclamos' }
        ]
      },
      {
        icon: 'money',
        title: 'Finanzas',
        grupo: 'finanzas',
        children: [
          { title: 'Comprobantes', link: '/admin/comprobantes' },
          { title: 'Reportes', link: '/admin/reportes' }
        ]
      },
      {
  icon: 'shield',
  title: 'Administradores',
  grupo: 'usuarioss',
  children: [
    { title: 'Lista de Cuentas', link: '/admin/usuarios' },
    { title: 'Agregar Cuenta', link: '/admin/usuarios/create' }
  ]
}

    ];
    

    // 🔹 Menú limitado (para otros roles)
    const limitedMenu: Menu[] = [
      {
        icon: 'fas fa-boxes',
        title: 'Gestión',
        grupo: 'mantenimiento',
        children: [
          { title: 'Productos', link: '/admin/mantenimiento/producto' }
        ]
      },
      {
        icon: 'fas fa-shopping-cart',
        title: 'Ventas',
        grupo: 'ventas',
        children: [
          { title: 'Órdenes', link: '/admin/ventas' }
        ]
      }
    ];

    // 🔹 Asignar menú según rol
    this.menus =
      rol === 'SuperAdmin'
        ? [...baseMenu, ...fullMenu] // acceso total
        : [...baseMenu, ...limitedMenu]; // menú básico
  }
}
