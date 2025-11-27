
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoServices } from '../../../../../../services/producto.services';
import { Product } from '../../../../../../../app/core/models/product.model';

  import { Router, RouterModule } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-mujer-novedades',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mujer-novedades.component.html',
  styleUrls: ['./mujer-novedades.component.css'] // ← aquí corregido
})
export class MujerNovedadesComponent implements OnInit { // ← aquí corregido
       productos: Product[] = [];
  productosFiltrados: Product[] = [];
  
  // Datos para filtros
  marcas: string[] = [];
  colores: string[] = [];
  tallas: string[] = [];
  rangoSeleccionado: { min: number | null; max: number | null } | null = null;
  
  // Filtros seleccionados
  marcasSeleccionadas: string[] = [];
  coloresSeleccionados: string[] = [];
  tallasSeleccionadas: string[] = [];
    precioMin: number | null = null;
  precioMax: number | null = null;
  // Filtros seleccionados

    rangosPrecio = [
    { label: 'S/0 - S/50', min: 0, max: 50 },
    { label: 'S/50 - S/100', min: 50, max: 100 },
    { label: 'S/100 - S/200', min: 100, max: 200 },
    { label: 'S/200 - S/400', min: 200, max: 400 },
    { label: 'S/400 - S/800', min: 400, max: 800 },
    { label: 'S/800 +', min: 800, max: null }
  ];
  menuVisible = false;
  constructor(private productoService: ProductoServices) {}

  ngOnInit(): void {
    this.productoService.getProductosPorCategoria('mujer_novedades').subscribe({ //aqui los 3 tienen que estar igual en create ts y edit ts
      next: res => {
        console.log('Productos cargados:', res.data); // Para debugging
        this.productos = res.data;
        this.productosFiltrados = [...this.productos];
        this.cargarFiltros();
      },
      error: err => {
        console.error('Error al cargar productos:', err);
        // Mostrar mensaje de error al usuario
      }
    });
  }

  cargarFiltros(): void {
    // Extraer valores únicos para los filtros
    this.marcas = [...new Set(this.productos.map(p => p.marca).filter(m => m))];
    this.colores = [...new Set(this.productos.map(p => p.color).filter(c => c))];
    this.tallas = [...new Set(this.productos.map(p => p.talla).filter(t => t))];
  }

  onFiltroChange(tipo: string, valor: string, event: any): void {
    const isChecked = event.target.checked;
    
    switch(tipo) {
      case 'marca':
        if (isChecked) {
          this.marcasSeleccionadas.push(valor);
        } else {
          this.marcasSeleccionadas = this.marcasSeleccionadas.filter(m => m !== valor);
        }
        break;
      case 'color':
        if (isChecked) {
          this.coloresSeleccionados.push(valor);
        } else {
          this.coloresSeleccionados = this.coloresSeleccionados.filter(c => c !== valor);
        }
        break;
      case 'talla':
        if (isChecked) {
          this.tallasSeleccionadas.push(valor);
        } else {
          this.tallasSeleccionadas = this.tallasSeleccionadas.filter(t => t !== valor);
        }
        break;
    }
    
    this.aplicarFiltros();
  }



  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath || imagePath.trim() === '') {
      return '/assets/images/no-image.png';
    }
   
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
     
    // Normalizar separadores y quitar 'wwwroot\' si existe
    const cleanedPath = imagePath
      .replace(/^wwwroot[\\/]+/, '') // quita wwwroot/ o wwwroot\
      .replace(/\\/g, '/'); // reemplaza \ por /
   
    return `https://pusher-backend-elvis.onrender.com/${cleanedPath}`;
  }

calcularDescuento(precioAntes: number, precioActual: number): number {
  if (!precioAntes || !precioActual || precioActual >= precioAntes) return 0;
  return Math.round(((precioAntes - precioActual) / precioAntes) * 100);
}


  // Método para verificar si hay productos
  hayProductos(): boolean {
    return this.productosFiltrados.length > 0;
  }

  // Método para obtener el mensaje cuando no hay productos
  getMensajeNoProductos(): string {
    if (this.productos.length === 0) {
      return 'No hay productos disponibles en esta categoría.';
    } else if (this.productosFiltrados.length === 0) {
      return 'No se encontraron productos con los filtros seleccionados.';
    }
    return '';
  }
aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(producto => {
      const cumpleMarca =
        this.marcasSeleccionadas.length === 0 ||
        this.marcasSeleccionadas.includes(producto.marca);

      const cumpleColor =
        this.coloresSeleccionados.length === 0 ||
        this.coloresSeleccionados.includes(producto.color);

      const cumpleTalla =
        this.tallasSeleccionadas.length === 0 ||
        this.tallasSeleccionadas.includes(producto.talla);

      // 🟢 Filtro de precio
      const cumplePrecio =
        !this.rangoSeleccionado ||
        (
          (!this.rangoSeleccionado.min ||
            producto.precio >= this.rangoSeleccionado.min) &&
          (!this.rangoSeleccionado.max ||
            producto.precio <= this.rangoSeleccionado.max)
        );

      return cumpleMarca && cumpleColor && cumpleTalla && cumplePrecio;
    });
  }

  seleccionarRangoPrecio(rango: any): void {
    // Si se selecciona de nuevo el mismo rango, se desmarca
    if (this.rangoSeleccionado === rango) {
      this.rangoSeleccionado = null;
    } else {
      this.rangoSeleccionado = rango;
    }
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.marcasSeleccionadas = [];
    this.coloresSeleccionados = [];
    this.tallasSeleccionadas = [];
    this.rangoSeleccionado = null;
    this.productosFiltrados = [...this.productos];

    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
    checkboxes.forEach(chk => (chk.checked = false));
  }



  
}