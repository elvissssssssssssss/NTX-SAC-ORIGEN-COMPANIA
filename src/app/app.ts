import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal.component'; // Asegúrate de que la ruta sea correcta
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
//import { FooterComponent } from './features/user/home/layout/footer/footer.component';


import { ProductListComponent } from './features/admin/products/product-list/product-list.component';
 
@NgModule({
  declarations: [
    // ... otros componentes declarados
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // ... otros módulos importados
  ],
  providers: [],
  bootstrap: [/* componente de bootstrap */]
})
export class AppModule { }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
     RouterOutlet,
    //FooterComponent, 
    ConfirmModalComponent  // Importa el componente modal
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'textil';

  constructor(private modalService: NgbModal) {}

  openModal() {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Eliminar producto';
    modalRef.componentInstance.message = '¿Estás seguro de eliminar este producto?';
    
    modalRef.result.then((result) => {
      if (result === 'confirmed') {
        console.log('Acción confirmada');
        // Aquí tu lógica para eliminar
      }
    }).catch((reason) => {
      console.log('Modal descartado', reason);
    });
  }
}