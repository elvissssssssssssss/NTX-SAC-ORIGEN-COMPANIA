  // src/app/features/user/cart/pages/cart.component.ts

  import { Component, OnInit } from '@angular/core';
  import { CartItem } from '../../../cart/models/cart.model';
  import { CartService } from '../../services/cart.service';
  import { CommonModule } from '@angular/common';
  import { AuthService } from '../../../auth/services/auth.service'; // Ajusta ruta si cambia
  import { ActivatedRoute, Router, RouterModule } from '@angular/router';

  import { FormsModule } from '@angular/forms';

  @Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css'],
    standalone: true,
      imports: [CommonModule, RouterModule, FormsModule],
  })
  export class CartComponent implements OnInit {
    carrito: CartItem[] = [];
    subTotal: number = 0;
  tax: number = 0;

    
    total: number = 0;
    isLoggedIn: boolean = false;
    userId: number = 0;


  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router // 👈 agregado
  ) {}

  ngOnInit(): void {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        this.userId = parsed.id;
        this.isLoggedIn = true;
        this.cargarCarrito();
      }
    }

    cargarCarrito(): void {
    this.cartService.obtenerCarritoPorUsuario(this.userId).subscribe({
      next: (res) => {
        this.carrito = res.items;
        this.subTotal = this.carrito.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
        this.total = this.subTotal + this.tax;
      },
      error: (err) => console.error('Error cargando carrito', err)
    });
  }





  
eliminarItem(cartItemId: number): void {
  this.cartService.eliminarItemDelCarrito(cartItemId, this.userId).subscribe({
    next: () => this.cargarCarrito(),
    error: (err) => console.error('Error al eliminar producto', err)
  });
}


  procesarPago(): void {
  if (!this.isLoggedIn) {
    this.router.navigate(['/auth/login']);
  } else {
    this.router.navigate(['/user/envio']);
  }
}


  getImageUrl(path: string): string {
    if (!path) return 'assets/images/no-image.png';
    return path.includes('wwwroot')
      ? 'https://pusher-backend-elvis.onrender.com/' + path.replace(/^wwwroot[\\/]+/, '').replace(/\\/g, '/')
      : 'https://pusher-backend-elvis.onrender.com/' + path;
  }


  actualizarCantidad(item: CartItem): void {
  if (item.id) {
    this.cartService.actualizarCantidadItem(item.id, item.quantity).subscribe({
      next: () => this.cargarCarrito(),
      error: (err) => console.error('Error al actualizar cantidad', err)
    });
  }
}

}