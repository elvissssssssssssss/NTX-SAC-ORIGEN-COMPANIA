
import { VentaResponse } from '../../user/payment/models/venta.model';
import { VentaService } from '../../user/payment/services/venta.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-ventas',
      standalone: true,
   imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  ventas: VentaResponse[] = [];
  ventaSeleccionada: VentaResponse | null = null;
  cargando: boolean = false;

  constructor(
    private ventaService: VentaService,
    private fb: FormBuilder, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando = true;
    this.ventaService.obtenerVentas().subscribe({
      next: data => {
        this.ventas = data;
        this.cargando = false;
        console.log('Ventas con envío:', data);
      },
      error: err => {
        console.error('Error al obtener ventas:', err);
        this.cargando = false;
      }
    });
  }

  // Función para ver el detalle completo de una venta
  verDetalleCompleto(venta: VentaResponse): void {
    this.ventaSeleccionada = venta;
    
    // Opcional: hacer scroll hacia el detalle
    setTimeout(() => {
      const elemento = document.querySelector('.card');
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // Cerrar el detalle
  cerrarDetalle(): void {
    this.ventaSeleccionada = null;
  }

  // Imprimir venta CON información de envío
  imprimirVenta(venta: VentaResponse): void {
    const seccionEnvio = venta.envio ? `
      <div class="info">
        <h3>Información de Envío</h3>
        <p><strong>Dirección:</strong> ${venta.envio.direccion}</p>
        <p><strong>Región:</strong> ${venta.envio.region}</p>
        <p><strong>Provincia:</strong> ${venta.envio.provincia}</p>
        <p><strong>Localidad:</strong> ${venta.envio.localidad}</p>
        <p><strong>DNI:</strong> ${venta.envio.dni}</p>
        <p><strong>Teléfono:</strong> ${venta.envio.telefono}</p>
      </div>
    ` : '';

    const contenidoImpresion = `
      <html>
        <head>
          <title>Venta #${venta.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .info { 
              margin-bottom: 20px; 
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .total { 
              font-weight: bold; 
              font-size: 1.2em; 
              text-align: right;
              margin-top: 20px;
              padding: 10px;
              background: #e8f5e8;
              border-radius: 5px;
            }
            .empresa {
              text-align: center;
              margin-bottom: 20px;
            }
            h3 {
              color: #333;
              border-bottom: 2px solid #007bff;
              padding-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="empresa">
            <h2>MI EMPRESA</h2>
            <p>Dirección de la empresa<br>Teléfono: 123-456-789</p>
          </div>
          
          <div class="header">
            <h1>Comprobante de Venta</h1>
            <p>Venta #${venta.id}</p>
          </div>
          
          <div class="info">
            <h3>Información del Cliente</h3>
            <p><strong>Cliente:</strong> ${venta.usuarioEmail}</p>
            <p><strong>Método de Pago:</strong> ${venta.metodoPagoNombre}</p>
            <p><strong>Fecha:</strong> ${new Date(venta.fechaVenta).toLocaleString('es-PE')}</p>
          </div>

          ${seccionEnvio}

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${venta.detalles.map(det => `
                <tr>
                  <td>${det.nombreProducto}</td>
                  <td>${det.cantidad}</td>
                  <td>S/. ${det.precio.toFixed(2)}</td>
                  <td>S/. ${(det.cantidad * det.precio).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>TOTAL: S/. ${venta.total.toFixed(2)}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 0.9em; color: #666;">
            <p>Gracias por su compra</p>
          </div>
        </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      ventanaImpresion.print();
    }
  }

  // Exportar venta a CSV CON información de envío
  exportarVenta(venta: VentaResponse): void {
    const datosEnvio = venta.envio ? [
      [''],
      ['INFORMACIÓN DE ENVÍO'],
      ['Dirección', venta.envio.direccion],
      ['Región', venta.envio.region],
      ['Provincia', venta.envio.provincia],
      ['Localidad', venta.envio.localidad],
      ['DNI', venta.envio.dni],
      ['Teléfono', venta.envio.telefono]
    ] : [];

    const datosCSV = [
      ['INFORMACIÓN DE VENTA'],
      ['ID', venta.id],
      ['Usuario', venta.usuarioEmail],
      ['Método de Pago', venta.metodoPagoNombre],
      ['Total', venta.total],
      ['Fecha', venta.fechaVenta],
      ...datosEnvio,
      [''],
      ['DETALLE DE PRODUCTOS'], 
      ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'],
      ...venta.detalles.map(det => [
        det.nombreProducto,
        det.cantidad,
        det.precio,
        (det.cantidad * det.precio).toFixed(2)
      ]),
      [''],
      ['TOTAL', '', '', venta.total.toFixed(2)]
    ];

    const csvContent = datosCSV.map(row => 
      Array.isArray(row) ? row.join(',') : row
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `venta_${venta.id}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Venta exportada exitosamente');
  }
  
// ✅ Método para obtener iniciales del nombre completo
getInitialsFromName(nombreCompleto: string): string {
  if (!nombreCompleto) return '?';
  
  const partes = nombreCompleto.trim().split(' ');
  if (partes.length >= 2) {
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }
  return partes[0].charAt(0).toUpperCase();
}
}