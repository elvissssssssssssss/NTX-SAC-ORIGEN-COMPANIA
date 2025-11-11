import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
;
 import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComprobanteService } from '../../../user/payment/services/comprobante.service';
import { ComprobanteRequest, ComprobanteResponse } from '../../../user/payment/models/comprobante.model';
import { NgZone } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago-exitoso',
   standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pago-exitoso.component.html',
  styleUrl: './pago-exitoso.component.css'
})


export class PagoExitosocomponent implements  OnInit {
  ventaId: number = 0;
  //  NUEVO: datos requeridos para BOLETA
  clienteNombres = '';
  clienteApellidos = '';
  clienteDNI = '';
  // UI: boleta por defecto
  tipoComprobante: 'boleta' | 'factura' = 'boleta';
  datosFactura = { ruc: '', razonSocial: '' };
  // Para factura
 

  // Para mostrar botón/enlace manual si el navegador bloquea el popup
  ultimoPdfUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private comprobanteService: ComprobanteService,
    private ngZone: NgZone // 👈 añade NgZone
  ) {}

   ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.ventaId = Number(params['ventaId']) || 0;
      console.log('VentaId recibido:', this.ventaId);
    });

    // Prefill desde localStorage si tienes algo guardado
    const envioTmp = localStorage.getItem('envioTemporal');
    if (envioTmp) {
      try {
        const envio = JSON.parse(envioTmp);
        this.clienteDNI = envio?.dni || '';
      } catch {}
    }
    const pagoTmp = localStorage.getItem('pagoTemporal');
    if (pagoTmp) {
      try {
        const pago = JSON.parse(pagoTmp);
        this.clienteNombres = (pago?.clienteNombres || '').trim();
        this.clienteApellidos = (pago?.clienteApellidos || '').trim();
      } catch {}
    }
  }

  emitirComprobante(): void {
    if (!this.ventaId) {
      alert('Venta inválida.');
      return;
    }

    // Backend: 1 = Factura, 2 = Boleta
    const tipoComprobanteId = this.tipoComprobante === 'boleta' ? 2 : 1;

    // Validaciones rápidas según tipo
    if (tipoComprobanteId === 2) { // Boleta
      if (!this.clienteNombres.trim() || !this.clienteApellidos.trim()) {
        alert('Para boleta se requiere nombres y apellidos del cliente');
        return;
      }
    } else { // Factura
      if (!this.datosFactura.ruc || !this.datosFactura.razonSocial) {
        alert('Para factura ingrese RUC y Razón Social');
        return;
      }
    }

    const payload: ComprobanteRequest = {
      ventaId: this.ventaId,
      tipoComprobante: tipoComprobanteId,
      numeroForzado: 0,
      // 👇 REQUERIDOS para boleta
      clienteDNI: this.tipoComprobante === 'boleta' ? (this.clienteDNI || '') : '',
      clienteNombres: this.tipoComprobante === 'boleta' ? this.clienteNombres.trim() : '',
      clienteApellidos: this.tipoComprobante === 'boleta' ? this.clienteApellidos.trim() : '',
      // 👇 REQUERIDOS para factura
      ruc: this.tipoComprobante === 'factura' ? this.datosFactura.ruc : '',
      razonSocial: this.tipoComprobante === 'factura' ? this.datosFactura.razonSocial : ''
    };

    this.comprobanteService.emitirComprobante(payload).subscribe({
      next: (res: ComprobanteResponse) => {
        const enlacePdf =
          (res as any)?.enlace_pdf ||
          (res as any)?.enlacePdf ||
          (res as any)?.respuesta_nubefact?.enlace_del_pdf ||
          (res as any)?.respuesta_nubefact?.enlace ||
          null;

        this.ultimoPdfUrl = enlacePdf || null;

        if (enlacePdf) {
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => window.open(enlacePdf, '_blank'), 300);
          });
        } else {
          alert('Comprobante emitido, pero no se encontró el enlace PDF.');
        }
      },
      error: (err) => {
        console.error('❌ Error al emitir:', err);
        const detalle = err?.error?.mensaje || err?.message || 'Error desconocido';
        alert('Error al emitir el comprobante: ' + detalle);
      }
    });
  }

  volverAlInicio(): void { window.location.href = '/'; }
  abrirPdf(): void { if (this.ultimoPdfUrl) window.open(this.ultimoPdfUrl, '_blank'); }
}