import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoServices } from '../../../../services/producto.services';

import { Product } from '../../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../user/auth/services/auth.service';
import { CartService } from '../../../user/cart/services/cart.service';
import { CartItem } from '../../cart/models/cart.model';

@Component({
  
  selector: 'app-producto-detalle',
   standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent  implements OnInit {
  producto!: Product;
  tallaSeleccionada: string = '';
  cantidadSeleccionada: number = 1;
  verMas = false;

  mainImage: string = '';
showZoom = false;
lensX = 0;
lensY = 0;
zoomStyle: any = {};

zoomScale = 1; // Control del zoom
  cantidadesDisponibles: number[] = [];

constructor(
  private route: ActivatedRoute,
  private productoService: ProductoServices,
  private cartService: CartService,
  private authService: AuthService, 
    private router: Router // 👈 Agregado aquí
) {}


ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.productoService.getProductoPorId(+id).subscribe({
      next: (producto) => {
        this.producto = producto;
        // Mostrar la primera imagen como principal
        this.mainImage = this.getImageUrl(producto.imagen ?? producto.imagen2 ?? producto.imagen3 ?? '');
        const maxCantidad = Math.min(producto.stock, 2);
        this.cantidadesDisponibles = Array.from({ length: maxCantidad }, (_, i) => i + 1);
      },
      error: err => console.error('Error al obtener producto:', err)
    });
  }
}
moveLens(event: MouseEvent) {
  const container = (event.target as HTMLElement).closest('.zoom-container') as HTMLElement;
  const img = container.querySelector('.main-image') as HTMLImageElement;
  const rect = img.getBoundingClientRect();

  const lensSize = 120; // tamaño del cuadro
  const zoomFactor = 3; // nivel de zoom

  let x = event.clientX - rect.left - lensSize / 2;
  let y = event.clientY - rect.top - lensSize / 2;

  // evitar salirse
  x = Math.max(0, Math.min(x, rect.width - lensSize));
  y = Math.max(0, Math.min(y, rect.height - lensSize));

  this.lensX = x;
  this.lensY = y;

  // Coordenadas relativas en porcentaje
  const fx = x / rect.width;
  const fy = y / rect.height;

  // 🔥 Ajuste clave: mueve la imagen dentro del zoom proporcionalmente
  this.zoomStyle = {
    transform: `translate(${-fx * (img.width * (zoomFactor - 1))}px, ${-fy * (img.height * (zoomFactor - 1))}px) scale(${zoomFactor})`,
    transformOrigin: 'top left',
  };
}


getImageUrl(path: string): string {
  if (!path) return '';
  // Normaliza barras y elimina prefijos innecesarios
  const cleanPath = path.replace(/^wwwroot[\\/]+/, '').replace(/\\/g, '/');
  // Devuelve la URL correcta
  return `https://pusher-backend-elvis.onrender.com/${cleanPath}`;
}
/** Cambiar imagen principal */
changeMainImage(url: string) {
  this.mainImage = url;
}

/** Efecto de zoom */
zoomImage(event: MouseEvent) {
  const img = event.target as HTMLElement;
  const rect = img.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  img.style.transformOrigin = `${x}% ${y}%`;
  img.style.transform = 'scale(2)'; // Ajusta la escala a tu gusto
}

/** Restablecer zoom */
resetZoom() {
  const imgs = document.querySelectorAll('.zoom-image') as NodeListOf<HTMLElement>;
  imgs.forEach(img => img.style.transform = 'scale(1)');
}
 agregarAlCarrito(): void {
  if (!this.authService.isLoggedIn()) {
  alert('Debes iniciar sesión para agregar productos al carrito.');
  this.router.navigate(['/auth/login']); // 🔁 redirigir al login
  return;
}


  const user = this.authService.getUser();
  if (!user || !user.id) {
    alert('No se pudo obtener el usuario.');
    return;
  }

  if (!this.tallaSeleccionada) {
    alert('Por favor, selecciona una talla.');
    return;
  }

  const item: CartItem = {
    userId: user.id,
    productId: this.producto.id,
    talla: this.tallaSeleccionada,
    quantity: this.cantidadSeleccionada
  };

 this.cartService.agregarAlCarrito(item).subscribe({
  next: () => {
    
    this.router.navigate(['/carrito']); // 🔁 Redirige al carrito
  },

    error: err => {
      console.error('Error al agregar al carrito:', err);
      alert('Hubo un error al agregar al carrito.');
    }
  });
}
toggleVerMas() {
  this.verMas = !this.verMas;
}
}
