// File: src/app/features/admin/products/product-create/product-create.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoServices } from '../../../../services/producto.services';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent {
  productoForm: FormGroup;
  imagenesSeleccionadas: { [key: string]: File } = {};
  isLoading = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  imagenPreview: string | null = null;
imagen2Preview: string | null = null;
imagen3Preview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoServices,
    private router: Router
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

  // ... (keep all your existing methods like onFileSelected, hasError, etc.)

 guardar() {
    // Validaciones iniciales
    if (this.productoForm.invalid) {
      this.markFormGroupTouched(this.productoForm);
      this.mensajeError = 'Por favor, completa todos los campos requeridos correctamente.';
      this.mensajeExito = null;
      return;
    }

    if (!this.imagenesSeleccionadas['imagen']) {
      this.mensajeError = 'La imagen principal es requerida';
      this.mensajeExito = null;
      return;
    }

    // Inicio del proceso
    this.isLoading = true;
    const startTime = Date.now(); // Para el tiempo mínimo de visualización
    
    const formData = new FormData();
    
    // Construcción del FormData
    Object.entries(this.productoForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    ['imagen', 'imagen2', 'imagen3'].forEach((field) => {
      if (this.imagenesSeleccionadas[field]) {
        formData.append(field, this.imagenesSeleccionadas[field]);
      }
    });

    // Llamada al servicio
    this.productoService.createProduct(formData).subscribe({
      next: (response) => {
        // Calculamos el tiempo restante para completar 1.5 segundos mínimo
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(1500 - elapsedTime, 0);

        setTimeout(() => {
          this.isLoading = false;
          this.mensajeExito = '✔ Producto creado exitosamente';
          this.mensajeError = null;
          
          // Redirigir después de 2 segundos (contados desde que aparece el mensaje)
          setTimeout(() => {
            this.router.navigate(['/admin/mantenimiento/producto']);
          }, 2000);
          
        }, remainingTime);
      },
      error: (err) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(1500 - elapsedTime, 0);

        setTimeout(() => {
          this.isLoading = false;
          this.mensajeExito = null;
          
          if (err.error?.message) {
            this.mensajeError = `✖ ${err.error.message}`;
          } else if (err.error?.errors) {
            const errors = Object.values(err.error.errors).flat();
            this.mensajeError = `✖ ${errors.join(', ')}`;
          } else {
            this.mensajeError = '✖ Error al crear producto';
          }
          
          setTimeout(() => this.mensajeError = null, 5000);
        }, remainingTime);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

    onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      // Validaciones originales (igual que en creación)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)');
        event.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        event.target.value = '';
        return;
      }

      // Mantener el comportamiento original
      this.imagenesSeleccionadas[field] = file;
      console.log(`Archivo seleccionado para ${field}:`, file.name);

      // Nueva funcionalidad para vista previa
      this.generateImagePreview(file, field);
    }
  }
   private generateImagePreview(file: File, field: string): void {
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
  


  cancelar() {
    this.router.navigate(['/admin/mantenimiento/producto']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos para mostrar errores en el template
  hasError(field: string): boolean {
    const control = this.productoForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.productoForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${field} es requerido`;
      if (control.errors['maxlength']) return `${field} excede la longitud máxima`;
      if (control.errors['min']) return `${field} debe ser mayor a ${control.errors['min'].min}`;
    }
    return '';
  }
}