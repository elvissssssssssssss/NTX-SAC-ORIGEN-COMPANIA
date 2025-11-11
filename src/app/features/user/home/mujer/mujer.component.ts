import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Headercomponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  selector: 'app-mujer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Headercomponent,
    FooterComponent
  ],
  templateUrl: './mujer.component.html',
  styleUrls: ['./mujer.component.css']
})
export class MujerComponent implements OnInit, OnDestroy {
  
  // Propiedades del carrusel
  diapositivaIndex: number = 0;
  private intervalo: any;
  
  // Array de imágenes del carrusel
  imagenesCarrusel = [
    {
      src: 'images/casacasMujer.jpg',
      alt: 'Casacas de mujer'
    },
    {
      src: 'images/chompasMujer.jpg',
      alt: 'Chompas de mujer 2'
    },
    {
      src: 'images/chompasMujer2.jpg',
      alt: 'Chompas de mujer'
    }
  ];

  ngOnInit(): void {
    this.iniciarCarruselAutomatico();
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  // Iniciar el carrusel automático
  iniciarCarruselAutomatico(): void {
    this.intervalo = setInterval(() => {
      this.pasarDiapositiva(1);
    }, 5000);
  }

  // Pasar a la siguiente o anterior diapositiva
  pasarDiapositiva(n: number): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    
    this.diapositivaIndex += n;
    
    // Controlar los límites del índice
    if (this.diapositivaIndex >= this.imagenesCarrusel.length) {
      this.diapositivaIndex = 0;
    } else if (this.diapositivaIndex < 0) {
      this.diapositivaIndex = this.imagenesCarrusel.length - 1;
    }
    
    this.iniciarCarruselAutomatico();
  }

  // Ir a una diapositiva específica
  diapositivaActual(n: number): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    
    this.diapositivaIndex = n;
    this.iniciarCarruselAutomatico();
  }

  // Verificar si una diapositiva está activa
  esDiapositivaActiva(index: number): boolean {
    return this.diapositivaIndex === index;
  }
}