import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
  
  imports: [CommonModule] // 👈 Asegúrate de incluir esto
})
export class ConfirmModalComponent {
  // Título del modal (personalizable)
  @Input() title: string = 'Confirmar Acción';
  
  // Mensaje principal (puede contener HTML)
  @Input() message: string = '¿Estás seguro de que deseas realizar esta acción?';
  
  // Mensaje adicional (opcional)
  @Input() additionalMessage: string = '';
  
  // Texto del botón de confirmación (personalizable)
  @Input() confirmButtonText: string = 'Confirmar';
  
  // Texto del botón de cancelar (personalizable)
  @Input() cancelButtonText: string = 'Cancelar';
  
  // Clase del botón de confirmación (personalizable)
  @Input() confirmButtonClass: string = 'btn-danger';

  constructor(public activeModal: NgbActiveModal) {}

  /**
   * Método que se ejecuta al confirmar la acción
   */
  confirm(): void {
    this.activeModal.close('confirm');
  }

  /**
   * Método que se ejecuta al cancelar la acción
   */
  dismiss(): void {
    this.activeModal.dismiss('cancel');
  }
}