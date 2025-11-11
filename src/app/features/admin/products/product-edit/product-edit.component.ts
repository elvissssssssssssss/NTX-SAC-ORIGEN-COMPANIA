import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoServices } from '../../../../services/producto.services';
import { Product } from '../../../../core/models/product.model';
import { animate, style, transition, trigger } from '@angular/animations';

//src/app/features/admin/products/product-edit/product-edit.component.ts
@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css'],
  animations: [
    trigger('slideInDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ProductEditComponent implements OnInit {
  productoForm: FormGroup;
  productId!: number;
  mensajeExito: string = '';
  mensajeError: string = '';
  imagenesSeleccionadas: { [key: string]: File } = {};

  imagenPreview: string | null = null;
imagen2Preview: string | null = null;
imagen3Preview: string | null = null;
// Rutas de imágenes existentes
  currentImagen: string | null = null;
  currentImagen2: string | null = null;
  currentImagen3: string | null = null;
  
  isSubmitting: boolean = false;

  // Opciones para selects
  categorias = [
      { group: '👨 Hombre', options: [
      'hombre_novedades',
      'hombre_ntx_prom',
      'hombre_uniformes_deportivas',
      'hombre_ropa_corporativa'
    
    ]},
    { group: '👩 Mujer', options: [
      'mujer_novedades', 
      'mujer_ropa_corporativa', 
      'mujer_ntx_prom'
    ]},
   
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductoServices
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      marca: ['', [Validators.required, Validators.maxLength(255)]],
      color: ['', [Validators.required, Validators.maxLength(255)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      precioDescuento: [0, [Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      talla: ['', [Validators.required, Validators.maxLength(10)]],
      code: ['', [Validators.required, Validators.maxLength(255)]],
      categoria: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.cargarProducto();
      }
    });
  }
cargarProducto(): void {
  this.productService.getProducts().subscribe({
    next: (result) => {
      console.log('Datos recibidos:', result.data);
      const producto = result.data.find(p => p.id === this.productId);
      if (producto) {
        console.log('Producto encontrado:', producto);
        console.log('Imagen del producto:', producto.imagen);
        // Cargar datos del formulario
        this.productoForm.patchValue({
          nombre: producto.nombre,
          categoria: producto.categoria,
          marca: producto.marca,
          code: producto.code,
          stock: producto.stock,
          description: producto.description,
          color: producto.color,
          talla: producto.talla,
          precio: producto.precio,
          precioDescuento: producto.precioDescuento
        });

        // Asignar las rutas de imágenes actuales con validación
        this.currentImagen = producto.imagen || null;
        this.currentImagen2 = producto.imagen2 || null;
        this.currentImagen3 = producto.imagen3 || null;

        // Debug: Imprimir las rutas para verificar
        console.log('Imagen 1:', this.currentImagen);
        console.log('Imagen 2:', this.currentImagen2);
        console.log('Imagen 3:', this.currentImagen3);
        console.log('URL construida 1:', this.getImageUrl(this.currentImagen));

      } else {
        this.mensajeError = 'Producto no encontrado';
      }
    },
    error: (err) => {
      this.mensajeError = 'Error al cargar el producto';
      console.error('Error loading product:', err);
    }
  });
}
// 4. Método para verificar si una imagen existe
checkImageExists(url: string): boolean {
  const img = new Image();
  img.src = url;
  return img.complete && img.naturalHeight !== 0;
}



onFileSelected(event: any, field: string): void {
    const file = event.target.files[0];
    if (file) {
      // Validaciones (tipo y tamaño)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.mensajeError = 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)';
        event.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.mensajeError = 'El archivo es demasiado grande. Máximo 5MB';
        event.target.value = '';
        return;
      }

      // Guardar archivo seleccionado
      this.imagenesSeleccionadas[field] = file;
      
      // Generar vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        switch(field) {
          case 'imagen':
            this.imagenPreview = e.target?.result as string;
            break;
          case 'imagen2':
            this.imagen2Preview = e.target?.result as string;
            break;
          case 'imagen3':
            this.imagen3Preview = e.target?.result as string;
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
getImageUrl(imagePath: string | null): string {
  if (!imagePath) return '/assets/images/no-image.png'; // Imagen por defecto
  
  // Si ya es una URL completa
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si la ruta ya incluye 'uploads/'
   // Normalizar separadores y quitar 'wwwroot\' si existe
  const cleanedPath = imagePath
    .replace(/^wwwroot[\\/]+/, '') // quita wwwroot/ o wwwroot\
    .replace(/\\/g, '/'); // reemplaza \ por /

  return `https://pusher-backend-elvis.onrender.com/${cleanedPath}`;
}
async guardar(): Promise<void> {
  if (this.productoForm.invalid) {
    this.productoForm.markAllAsTouched();
    this.mensajeError = 'Por favor complete coronImageErrorrectamente todos los campos requeridos';
    return;
  }

  this.isSubmitting = true;
  this.mensajeError = '';

  const formData = new FormData();
 
  // Agrega todos los campos del formulario
  Object.keys(this.productoForm.value).forEach(key => {
    const value = this.productoForm.get(key)?.value;
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value.toString());
    }
  });

  // ✅ AGREGAR: Incluir las imágenes seleccionadas
  if (this.imagenesSeleccionadas['imagen']) {
    formData.append('imagen', this.imagenesSeleccionadas['imagen']);
  }
  if (this.imagenesSeleccionadas['imagen2']) {
    formData.append('imagen2', this.imagenesSeleccionadas['imagen2']);
  }
  if (this.imagenesSeleccionadas['imagen3']) {
    formData.append('imagen3', this.imagenesSeleccionadas['imagen3']);
  }

  try {
    const response = await this.productService.updateProduct(this.productId.toString(), formData).toPromise();
    this.mensajeExito = 'Producto actualizado correctamente';
    setTimeout(() => this.router.navigate(['/admin/mantenimiento/producto']), 2000);
  } catch (err) {
    this.mensajeError = 'Error al actualizar el producto. Por favor, inténtelo de nuevo más tarde.';
    console.error('Error:', err);
  } finally {
    this.isSubmitting = false;
  }
}




  cancelar(): void {
    if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/mantenimiento/producto']);
    }
  }








  
}