// shared-mant.ts
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Pipes de Angular
import { DatePipe, AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';

// PrimeNG Modules



export const SHARED_MANT_IMPORTS = [
    // Módulos de Angular Core
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,

    // Pipes
    DatePipe,
    AsyncPipe,
    CurrencyPipe,
    DecimalPipe,

   

];