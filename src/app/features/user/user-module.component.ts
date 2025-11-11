import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// 👇 IMPORTA el componente con el nombre correcto (respeta la mayúscula "C")
import { ProductoDetalleComponent } from '../user/shop/producto-detalle/producto-detalle.component';

import { UserRoutingModulecomponnt } from './user-routing-module.component';

@NgModule({
  declarations: [
    // No se declara un componente standalone
  ],
  imports: [
    CommonModule,
    UserRoutingModulecomponnt,
    ProductoDetalleComponent// ✅ Aquí lo importas (NO declarar)
  ]
})
export class UserModulecomponnt { }
