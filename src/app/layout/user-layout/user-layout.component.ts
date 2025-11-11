import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Headercomponent } from '../../features/user/home/layout/header/header.component';
import { FooterComponent } from '../../features/user/home/layout/footer/footer.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterModule, Headercomponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="contenido-principal">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `
})
export class UserLayoutComponent {}
