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
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
 //  imports: [RouterModule] // si usas routerLink
})

export class nosotroscomponent  implements OnInit {

 
constructor() {}

ngOnInit(): void {
 
}


}
