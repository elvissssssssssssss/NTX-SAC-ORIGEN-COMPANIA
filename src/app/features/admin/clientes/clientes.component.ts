//import { Component } from '@angular/core';
import { User } from '../../user/auth/models/user.model'; 
import { AuthService } from '../../user/auth/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';


@Component({
  selector: 'app-clientes',
    standalone: true,
   imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent  implements OnInit {
  usuarios: User[] = [];
   
  
  usuariosFiltrados: User[] = [];
  searchForm: FormGroup;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
 
     paginationOptions = [10, 25, 50, 100];
  
  // Meses para el filtro
  meses = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ];  



  constructor(
    
    private authService: AuthService,
    private fb: FormBuilder, 
    private router: Router

  
    
  )  {
    this.searchForm = this.fb.group({
      search: [''],
      mes_nacimiento: [''],
      per_page: [10]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupFormListeners();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.usuarios = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }

  setupFormListeners(): void {
    // Listener para búsqueda con delay
    this.searchForm.get('search')?.valueChanges.subscribe(() => {
      setTimeout(() => this.applyFilters(), 500);
    });

    // Listeners para cambios inmediatos
    this.searchForm.get('mes_nacimiento')?.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.searchForm.get('per_page')?.valueChanges.subscribe(() => {
      this.itemsPerPage = this.searchForm.get('per_page')?.value;
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.usuarios];
    const searchTerm = this.searchForm.get('search')?.value?.toLowerCase() || '';
    const mesNacimiento = this.searchForm.get('mes_nacimiento')?.value;

    // Filtrar por búsqueda (nombre, apellido, email)
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nombre?.toLowerCase().includes(searchTerm) ||
        user.apellido?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por mes de nacimiento
    if (mesNacimiento) {
      filtered = filtered.filter(user => {
        if (user.fecha_nacimiento) {
          const fechaNac = new Date(user.fecha_nacimiento);
          return fechaNac.getMonth() + 1 === parseInt(mesNacimiento);
        }
        return false;
      });
    }

    this.usuariosFiltrados = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset página al filtrar
  }

  clearFilters(): void {
    this.searchForm.reset({
      search: '',
      mes_nacimiento: '',
      per_page: 10
    });
    this.itemsPerPage = 10;
    this.currentPage = 1;
    this.applyFilters();
  }

  // Métodos de paginación
  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.usuariosFiltrados.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Mostrando ${start} - ${end} de ${this.totalItems} resultados`;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Métodos de utilidad
  getInitials(nombre: string, apellido: string): string {
    const n = nombre ? nombre.charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.charAt(0).toUpperCase() : '';
    return n + a;
  }

  calculateAge(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  isBirthdayToday(fechaNacimiento: string): boolean {
    if (!fechaNacimiento) return false;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
  }

  // Método para contar usuarios nuevos del mes
  get usuariosNuevosEsteMes(): number {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    
    return this.usuarios.filter(user => {
      if (user.created_at) {
        const fechaCreacion = new Date(user.created_at);
        return fechaCreacion >= inicioMes;
      }
      return false;
    }).length;
  }

  // Navegación
  verHistorial(userId: number): void {
    this.router.navigate(['/admin/customers/history', userId]);
  }

  // Exportar datos (placeholder)
  exportarExcel(): void {
    console.log('Exportando a Excel...');
    // Implementar lógica de exportación
  }

  exportarPDF(): void {
    console.log('Exportando a PDF...');
    // Implementar lógica de exportación
  }
}