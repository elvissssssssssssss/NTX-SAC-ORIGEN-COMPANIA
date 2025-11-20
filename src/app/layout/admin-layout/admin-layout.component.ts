
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  
  template: `
<app-header (sidebarToggle)="toggleSidebar()"></app-header>
<app-sidebar [open]="sidebarOpen"></app-sidebar>
<div class="main-content" [class.main-full]="!sidebarOpen">
  <router-outlet></router-outlet>
</div>
 <app-footer></app-footer>
  `,
  styleUrls: ['./admin-layout.css']
})
  export class AdminLayoutComponent  {
  sidebarOpen = true;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
}