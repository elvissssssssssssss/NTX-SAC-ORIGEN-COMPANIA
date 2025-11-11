  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Router, RouterModule } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
  import { DataHttp, Product } from '../../../../core/models/product.model';
  import { ProductoServices } from '../../../../services/producto.services';
  import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
  import { SHARED_MANT_IMPORTS } from '../../../../shared/shared-mant';


  @Component({
    selector: 'app-product-list',
    standalone: true,
    
    imports: [
    ...SHARED_MANT_IMPORTS, // ← Solo CommonModule, RouterModule, FormsModule 
    
  ],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
  })
  export class ProductListComponent implements OnInit {
    
    // Propiedades del componente
    products: Product[] = [];
    filteredProducts: Product[] = [];
    paginatedProducts: Product[] = [];
    
    // Estados
    loadProducts = false;
    successMessage = '';
    errorMessage = '';

    
    // Búsqueda y filtros
    searchTerm = '';
    
    // Paginación
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;
    
    // Ordenamiento
    sortField = 'id';
    sortDirection: 'asc' | 'desc' = 'asc';
    

    constructor(
      private productService: ProductoServices,
      private modalService: NgbModal,
      private router: Router
    ) {}

    ngOnInit(): void {
      this.loadProductData();
    }

    // Getter para total de items
    get totalItems(): number {
      return this.filteredProducts.length;
    }

    // Método para cargar datos desde tu API
    loadProductData(): void {
      this.loadProducts = true;
      this.errorMessage = '';
      
      this.productService.getProducts().subscribe({
        next: (result: DataHttp) => {
          console.log('API Response:', result);
          if (result && result.data) {
            this.products = result.data;
            this.filteredProducts = [...this.products];
            this.updatePagination();
            console.log("productos cargados:", this.products);
          } else {
            
          }
          this.loadProducts = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.errorMessage = 'Error al conectar con el servidor';
          this.loadProducts = false;
        },
        complete: () => {
          console.log("Carga de productos finalizada");
        }
      });
    }

    // Método para recargar productos
    reloadProducts(): void {
      this.loadProductData();
    }

    // Método de búsqueda
    applySearch(): void {
      if (!this.searchTerm.trim()) {
        this.filteredProducts = [...this.products];
      } else {
        const searchLower = this.searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter(product =>
          product.nombre.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.marca?.toLowerCase().includes(searchLower) ||
          product.categoria?.toLowerCase().includes(searchLower) ||
          product.code?.toLowerCase().includes(searchLower)
        );
      }
      this.currentPage = 1;
      this.sortProducts();
      this.updatePagination();
    }

    // Limpiar búsqueda
    clearSearch(): void {
      this.searchTerm = '';
      this.applySearch();
    }

    // Método de ordenamiento
    onSort(field: string): void {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.sortProducts();
      this.updatePagination();
    }

    sortProducts(): void {
      this.filteredProducts.sort((a, b) => {
        const valueA = a[this.sortField as keyof Product];
        const valueB = b[this.sortField as keyof Product];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return this.sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else if (typeof valueA === 'number' && typeof valueB === 'number') {
          return this.sortDirection === 'asc'
            ? valueA - valueB
            : valueB - valueA;
        }
        return 0;
      });
    }

    // Obtener icono de ordenamiento
    getSortIcon(field: string): string {
      if (this.sortField !== field) return 'fas fa-sort text-muted';
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
      openDeleteModal(product: Product): void {
      const modalRef = this.modalService.open(ConfirmModalComponent);
      modalRef.componentInstance.title = 'Confirmar Eliminación';
      modalRef.componentInstance.message = `¿Estás seguro de que deseas eliminar el producto <strong>${product.nombre}</strong>?`;
      modalRef.componentInstance.additionalMessage = 'Esta acción no se puede deshacer.';
      
      modalRef.result.then((result) => {
        if (result === 'confirm') {
          this.deleteProduct(product.id);
        }
      }).catch(() => {});
    }



    // Métodos de paginación
    updatePagination(): void {
      this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
      this.updatePaginatedProducts();
    }

    updatePaginatedProducts(): void {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    }

    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePaginatedProducts();
      }
    }
    getImageUrl(imagePath: string | null | undefined): string {
    // Si no hay imagen o es un string vacío
    if (!imagePath || imagePath.trim() === '') {
      return '/assets/images/no-image.png';
    }

    // Si ya es una URL completa
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Normalizar rutas locales
    const cleanedPath = imagePath
      .replace(/^wwwroot[\\/]+/, '')  // Elimina 'wwwroot/' o 'wwwroot\'
      .replace(/\\/g, '/');           // Reemplaza barras invertidas

    return `https://pusher-backend-elvis.onrender.com/${cleanedPath}`;
  }


    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updatePaginatedProducts();
      }
    }

    changePage(page: number): void {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }

    goToPage(page: number): void {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }

    getVisiblePages(): number[] {
      const pages: number[] = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }

    getStartIndex(): number {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    }

    getEndIndex(): number {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
    }

    // Métodos de stock
    getStockStatus(stock: number): string {
      if (stock > 10) return 'Disponible';
      if (stock > 0) return 'Pocas unidades';
      return 'Agotado';
    }

    getStockBadgeClass(stock: number): string {
      if (stock > 10) return 'bg-success text-white';
      if (stock > 0) return 'bg-warning text-dark';
      return 'bg-danger text-white';
    }

    // Métodos de acciones
    viewProduct(id: number): void {
      this.router.navigate(['/admin/products/view', id]);
    }

    editProduct(id: number): void {
    this.router.navigate(['/admin/mantenimiento/products/edit', id]);
  }

    // Modal de eliminación con NgBootstrap



    // TrackBy para mejor rendimiento
    trackByProductId(index: number, product: Product): number {
      return product.id;
    }
    
    private deleteProduct(productId: number): void {
      // Llamada real al servicio para eliminar
        this.productService.deleteProduct(productId).subscribe({

        next: () => {
          // Actualiza la lmensajeErrorista local
          this.products = this.products.filter(p => p.id !== productId);
          this.applySearch(); // Reaplica filtros
          
          // Muestra mensaje de éxito
          this.successMessage = 'Producto eliminado correctamente';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          console.error('Error al eliminar producto:', );
          this.errorMessage = 'Error al eliminar producto';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }

// En product-list.component.ts

// En product-list.component.ts
async toggleProductStatus(product: Product): Promise<void> {
  const nuevoEstado = !product.estado;
  
  // Abrir modal de confirmación
  const modalRef = this.modalService.open(ConfirmModalComponent);
  modalRef.componentInstance.title = 'Confirmar cambio de estado';
  modalRef.componentInstance.message = 
    `¿Estás seguro de que deseas ${nuevoEstado ? 'activar' : 'desactivar'} 
     el producto <strong>${product.nombre}</strong>?`;
  
  try {
    const result = await modalRef.result;
    if (result === 'confirm') {
      // Cambiar estado del producto
      product.estado = nuevoEstado;
      
      // Mostrar mensaje de éxito
      this.successMessage = 
        `Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`;
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => this.successMessage = '', 3000);
      
      console.log(`Estado cambiado a: ${nuevoEstado ? 'Activo' : 'Inactivo'}`);
      console.log('Nota: En una implementación completa, aquí se llamaría al servicio');
    }
  } catch (dismissReason) {
    // Modal fue descartado, no hacer nada
    console.log('Cambio de estado cancelado por el usuario');
  }
}
}





