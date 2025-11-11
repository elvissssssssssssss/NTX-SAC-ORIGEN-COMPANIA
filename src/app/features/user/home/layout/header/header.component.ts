import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ProductoServices } from '../../.../../../../../services/producto.services';
import { Product } from '../../../../../core/models/product.model';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
 //  imports: [RouterModule] // si usas routerLink
})

export class Headercomponent  implements OnInit {
isMenuOpen: boolean = false;
    searchQuery: string = '';
  showSuggestions: boolean = false;
    products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  suggestions: Product[] = [];
  isMobileSearchActive = false;
  nombreUsuario: string = '';

  activeTab: 'mujer' | 'hombre' = 'mujer';
  

  isAuthenticated: boolean = false; // Simulación, deberías enlazarlo con tu servicio de autenticación
  cartCount: number = 0; // Simulación, enlaza con tu servicio de carrito
  constructor(
    
    private authService: AuthService,
    private productoService: ProductoServices,
    roductoService: ProductoServices,
    
    private router: Router) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  setActiveTab(tab: 'mujer' | 'hombre'): void {
    this.activeTab = tab;
  }


  // header.component.ts

ngOnInit(): void {
  this.actualizarEstado();
}

// Este método revisa localStorage cada vez
ngDoCheck(): void {
  this.actualizarEstado();
}

actualizarEstado(): void {
  this.isAuthenticated = this.authService.isLoggedIn();
  const user = this.authService.getUser();
  this.nombreUsuario = user?.nombre || '';
}

   toggleMobileSearch() {
    this.isMobileSearchActive = !this.isMobileSearchActive;
  }

onSearchInput() {
  if (this.searchQuery.length >= 2) {
    this.productoService.searchProducts(this.searchQuery).subscribe({
      next: (results) => {
        this.suggestions = results;   // 👈 ya vienen con imagen y nombre
        this.showSuggestions = true;
      },
      error: (err) => {
        console.error('Error en búsqueda', err);
        this.showSuggestions = false;
      }
    });
  } else {
    this.showSuggestions = false;
  }
}


  onSearch() {
    if (!this.searchQuery.trim()) return;
    // Redirigir a página de resultados
    this.router.navigate(['/productos'], { queryParams: { q: this.searchQuery } });
    this.showSuggestions = false;
  }

  searchFor(query: string) {
    this.searchQuery = query;
    this.onSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSuggestions = false;
  }

  onSearchFocus() {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }
  getImageUrl(path: string): string {
  if (!path) return 'assets/no-image.png'; // placeholder
  return `https://pusher-backend-elvis.onrender.com/${path.replace('wwwroot\\', '').replace('wwwroot/', '')}`;
}
loadProducts(): void {
    this.productoService.getProducts().subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : [];
        this.filteredProducts = [...this.products];
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
      }
    });
  }

}
