import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ProductoServices } from '../../../../../services/producto.services';
import { Product } from '../../../../../core/models/product.model';



@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contacto.component.html',
   styleUrls: ['./contacto.component.css']
 //  imports: [RouterModule] // si usas routerLink
})

export class contactocomponent  implements OnInit {



  


constructor() {}

// header.component.ts
ngOnInit(): void {
  // Initialize component logic here
}


}
