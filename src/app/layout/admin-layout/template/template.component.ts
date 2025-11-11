import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-template',
  //aquí se puede referenciar el componente, modulo, pipe o otro recurso que vamos a utilizar
  imports: [
    HeaderComponent,
    SidebarComponent,
    CommonModule,
    RouterOutlet
],
  templateUrl: './template.component.html',
  styleUrl: './template.component.scss'
})
export class TemplateComponent {
  //DEBO TENER UNA FUNCION QUE RECIBA EL VALOR DEL COMPONENTE HIJO
  obtenerResultadoSuma(resultado:number){

    console.log("RESULTADO EN EL PADRE: ", resultado);

  }

}
