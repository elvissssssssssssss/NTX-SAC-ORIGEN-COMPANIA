//user/pago/pago.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../user/auth/services/auth.service';
import { CartService } from '../../../user/cart/services/cart.service';
import { EnvioService } from '../../../user/shipping/services/envio.service';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../../../user/cart/models/cart.model';
import { Envios } from '../../../user/shipping/models/envio.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComprobanteService } from '../../../user/payment/services/comprobante.service';
import { ComprobanteRequest, ComprobanteResponse } from '../../../user/payment/models/comprobante.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../user/payment/services/venta.service';
import { VentaCompletaRequest } from '../../../user/payment/models/venta.model';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {
  mercadoPago: any;
  userId: number = 0;
  carrito: CartItem[] = [];
  total: number = 0;
  subTotal: number = 0;
  clienteNombres: string = '';
  clienteApellidos: string = '';
  tax: number = 0;
  envioGasto: number = 0;
  mercadoPagoLoaded: boolean = false;
  isProcessingPayment: boolean = false;
  paymentBrickInitialized: boolean = false;
  metodoPago: string = 'tarjeta';
  tipoComprobante: string = 'boleta';
  mostrarTarjeta: boolean = false;  // ✅ Cambiado a false (cerrado por defecto)
mostrarVoucher: boolean = false;  // ✅ Ya estaba en false
voucherFile: File | null = null;
voucherPreview: string | null = null;
numeroOperacion: string = '';
isUploadingVoucher: boolean = false;
qrYapeUrl: string = 'assets/images/qr-yape.png'; // Pon tu ruta de imagen QR

  datosFactura = {
    ruc: '',
    razonSocial: ''
  };

  envio: Envios = {
    userId: 0,
    direccion: '',
    region: '',
    provincia: '',
    localidad: '',
    dni: '',
    telefono: ''
  };

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private envioService: EnvioService,
    private comprobanteService: ComprobanteService,
    private ventaService: VentaService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.userId = user.id;
    }

    const envioTemp = localStorage.getItem('envioTemporal');
    if (envioTemp) {
      this.envio = JSON.parse(envioTemp);
      this.envio.userId = this.userId;
    } else {
      alert('No se encontró información de envío. Redirigiendo...');
      this.router.navigate(['/user/envio']);
      return;
    }

    this.cargarCarrito();
    this.loadMercadoPagoScript();
  }

 cargarCarrito(): void {
  this.cartService.obtenerCarritoPorUsuario(this.userId).subscribe({
    next: (res) => {
      console.log('📦 Respuesta completa del carrito:', res);
      console.log('📦 res.items:', res.items);
      console.log('📦 Es array?:', Array.isArray(res.items));
      
      this.carrito = res.items;
      this.calcularTotales();
    },
    error: (err) => console.error('Error al cargar carrito', err)
  });
}


  calcularTotales(): void {
    this.subTotal = this.carrito.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    this.total = this.subTotal + this.tax + this.envioGasto;
  }

  getImageUrl(path: string): string {
    if (!path) return 'assets/images/no-image.png';
    return path.includes('wwwroot')
      ? 'https://pusher-backend-elvis.onrender.com/' + path.replace(/^wwwroot[\\/]+/, '').replace(/\\/g, '/')
      : 'https://pusher-backend-elvis.onrender.com/' + path;
  }

  onComprobanteChange(): void {
    if (this.tipoComprobante === 'boleta') {
      this.datosFactura.ruc = '';
      this.datosFactura.razonSocial = '';
    }
  }

  loadMercadoPagoScript(): void {
    if ((window as any).MercadoPago) {
      this.mercadoPagoLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      this.mercadoPagoLoaded = true;
      console.log('Mercado Pago SDK cargado');
    };
    script.onerror = () => {
      console.error('Error al cargar el SDK de Mercado Pago');
    };
    document.head.appendChild(script);
  }

  // ✅ TU MÉTODO initPaymentBrick() SIN CAMBIOS
  initPaymentBrick(): void {
    if (!this.mercadoPagoLoaded || this.paymentBrickInitialized) return;

    try {
      const mp = new (window as any).MercadoPago('APP_USR-6cab3990-96fe-4f93-98d6-2a46fad984c9', {
        locale: 'es-PE'
      });

      const bricksBuilder = mp.bricks();

      bricksBuilder.create('cardPayment', 'paymentBrick_container', {
        initialization: {
          amount: this.total,
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
          }
        },
        callbacks: {
          onReady: () => {
            this.paymentBrickInitialized = true;
            console.log('✅ Brick cargado correctamente');
          },
          onSubmit: (params: { formData: any }) => {
            console.log('💳 Pago completado:', params.formData);
            alert('✅ Pago simulado correctamente.');
            this.registrarVentaFinal();
            return Promise.resolve();
          },
          onError: (error: any) => {
            console.error('❌ Error en el Brick:', error);
            alert('❌ Ocurrió un error al procesar el pago');
          }
        }
      });
    } catch (error) {
      console.error('❌ Error al iniciar el Brick:', error);
    }
  }

  // ✅ TU MÉTODO iniciarCheckoutPro() SIN CAMBIOS
  iniciarCheckoutPro(): void {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (this.total <= 0) {
      alert('El total debe ser mayor a 0');
      return;
    }

    if (this.isProcessingPayment) {
      return;
    }

    this.isProcessingPayment = true;

    const items = this.carrito.map(item => ({
      title: item.productName || 'Producto',
      quantity: item.quantity || 1,
      unitPrice: this.calculateUnitPrice(item)
    }));

    if (this.envioGasto > 0) {
      items.push({
        title: 'Envío',
        quantity: 1,
        unitPrice: this.envioGasto
      });
    }

    console.log('Enviando items a Mercado Pago:', items);

    this.ventaService.crearPreferenciaPago(items).subscribe({
      next: (response) => {
        console.log('Respuesta de preferencia:', response);
        
        if (response?.sandboxInitPoint) {
          this.saveTemporaryData();
          window.location.href = response.sandboxInitPoint;
        } else if (response?.initPoint) {
          this.saveTemporaryData();
          window.location.href = response.initPoint;
        } else {
          this.isProcessingPayment = false;
          alert('No se pudo generar el enlace de pago. Intenta nuevamente.');
        }
      },
      error: (err) => {
        this.isProcessingPayment = false;
        console.error('Error al crear preferencia de pago:', err);
        alert('Error al procesar el pago. Intenta nuevamente.');
      }
    });
  }

  private calculateUnitPrice(item: CartItem): number {
    if (!item.quantity || item.quantity === 0) {
      return item.totalPrice || 0;
    }
    return (item.totalPrice || 0) / item.quantity;
  }

  private saveTemporaryData(): void {
    const tempData = {
      userId: this.userId,
      carrito: this.carrito,
      total: this.total,
      envio: this.envio,
      tipoComprobante: this.tipoComprobante,
      datosFactura: this.datosFactura,
      clienteNombres: this.clienteNombres,
      clienteApellidos: this.clienteApellidos,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem('pagoTemporal', JSON.stringify(tempData));
  }

  // 🔥 MÉTODO ACTUALIZADO CON ENVÍO AUTOMÁTICO DE EMAIL
  registrarVentaFinal(): void {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!this.clienteNombres.trim() || !this.clienteApellidos.trim()) {
      alert('⚠️ Por favor complete sus nombres y apellidos antes de continuar');
      return;
    }

    console.log('🛒 === INICIANDO REGISTRO DE VENTA FINAL ===');
    console.log('👤 Cliente:', `${this.clienteNombres} ${this.clienteApellidos}`);
    console.log('📦 Items:', this.carrito.length);
    console.log('💰 Total:', this.total);

    this.envioService.guardarEnvio(this.envio).subscribe({
      next: (envioResponse) => {
        console.log('🚚 Envío registrado:', envioResponse);

        const venta: VentaCompletaRequest = {
          userId: this.userId,
          metodoPagoId: 3,
          total: this.total,
          detalles: this.carrito.map(item => ({
            productoId: item.productId,
            nombreProducto: item.productName || 'Producto',
            cantidad: item.quantity || 1,
            precioUnitario: this.calculateUnitPrice(item)
          }))
        };

        console.log('📨 Enviando venta al backend (esto disparará el EMAIL automático):', venta);

        this.ventaService.registrarVentaCompleta(venta).subscribe({
          next: (ventaResponse) => {
            console.log('✅ Venta registrada exitosamente:', ventaResponse);
            console.log('📧 El backend debería haber enviado el email a:', ventaResponse.usuarioEmail);

            const ventaId = ventaResponse.id || ventaResponse.ventaId;

            if (!ventaId) {
              console.error('❌ No se obtuvo el ID de la venta');
              alert('Error: No se pudo obtener el ID de la venta');
              return;
            }

            this.emitirComprobanteElectronico(ventaId);
            this.limpiarDespuesDeCompra();

            alert(`✅ ¡Compra exitosa!\n\n` +
                  `Pedido #${ventaId}\n` +
                  `Total: S/ ${this.total.toFixed(2)}\n\n` +
                  `📧 Se ha enviado un email de confirmación a tu correo registrado.\n` +
                  `📄 El comprobante será generado en breve.`);

            setTimeout(() => {
              this.router.navigate(['/user/pago-exitoso'], {
                queryParams: { 
                  ventaId: ventaId, 
                  total: this.total
                }
              });
            }, 2000);
          },
          error: (err) => {
            console.error('❌ Error al registrar venta:', err);
            alert('❌ Error al finalizar la compra. Por favor intenta nuevamente.');
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al registrar envío:', err);
        alert('❌ Error al registrar el envío. Intenta nuevamente.');
      }
    });
  }

  // 📄 NUEVO MÉTODO: Emitir comprobante electrónico
 private emitirComprobanteElectronico(ventaId: number): void {
  const comprobanteData: ComprobanteRequest = {
    ventaId: ventaId,
    tipoComprobante: this.tipoComprobante === 'boleta' ? 2 : 1,
    numeroForzado: 0,
    clienteDNI: this.envio.dni || '',
    clienteNombres: this.clienteNombres.trim(),
    clienteApellidos: this.clienteApellidos.trim(),
    ruc: this.tipoComprobante === 'factura' ? this.datosFactura.ruc : '',
    razonSocial: this.tipoComprobante === 'factura' ? this.datosFactura.razonSocial : ''
  };

  console.log('📋 Emitiendo comprobante electrónico:', comprobanteData);

  this.comprobanteService.emitirComprobante(comprobanteData).subscribe({
    next: (res: ComprobanteResponse) => {
      console.log('✅ Comprobante emitido:', res);

      const enlacePdf = res?.enlace_pdf || 
                        res?.respuesta_nubefact?.enlace_del_pdf ||
                        res?.respuesta_nubefact?.enlace;

      if (enlacePdf) {
        console.log('📄 PDF generado:', enlacePdf);
        
        // ✨ Enviar email con PDF
        this.ventaService.notificarComprobante(ventaId).subscribe({
          next: (emailRes) => {
            console.log('✅ Email con PDF enviado:', emailRes);
          },
          error: (emailErr) => {
            console.warn('⚠️ Error al enviar email (no crítico):', emailErr);
          }
        });

        // Abrir PDF
        setTimeout(() => {
          window.open(enlacePdf, '_blank');
        }, 500);
      }
    },
    error: (err) => {
      console.error('⚠️ Error al emitir comprobante:', err);
    }
  });
}


  // 🧹 NUEVO MÉTODO: Limpiar después de compra
  private limpiarDespuesDeCompra(): void {
    this.cartService.limpiarCarrito(this.userId).subscribe({
      next: () => {
        console.log('🛒 Carrito limpiado');
        this.carrito = [];
        this.calcularTotales();
      },
      error: (err) => console.warn('⚠️ Error al limpiar carrito:', err)
    });

    localStorage.removeItem('pagoTemporal');
    localStorage.removeItem('envioTemporal');
  }

  // TUS MÉTODOS DE PRUEBA SIN CAMBIOS
  probarEmisionComprobante(): void {
    console.log('=== PRUEBA DE EMISIÓN DE COMPROBANTE ===');
    
    const comprobantePrueba: ComprobanteRequest = {
      ventaId: 87,
      tipoComprobante: 2,
      numeroForzado: 0,
      clienteDNI: "44556677",
      clienteNombres: "Juan",
      clienteApellidos: "Pérez",
      ruc: "",
      razonSocial: ""
    };

    console.log('Datos de comprobante de prueba:', JSON.stringify(comprobantePrueba, null, 2));

    this.comprobanteService.emitirComprobante(comprobantePrueba).subscribe({
      next: (response) => {
        console.log('✅ PRUEBA EXITOSA - Comprobante emitido:', response);
        
        if (response?.enlace_pdf) {
          console.log('📄 Abriendo PDF:', response.enlace_pdf);
          window.open(response.enlace_pdf, '_blank');
        }
        
        alert(`✅ Comprobante de prueba emitido!\nSerie: ${response.serie}\nNúmero: ${response.numero}`);
      },
      error: (err) => {
        console.error('❌ PRUEBA FALLIDA - Error:', err);
        alert('❌ Prueba fallida! Ver consola para detalles.');
      }
    });
  }

  simularRegresoDeMercadoPago(): void {
    this.router.navigate(['/user/pago-exitoso'], {
      queryParams: {
        payment_id: '1234567890',
        status: 'approved',
        merchant_order: '12345'
      }
    });
  }
toggleTarjeta(): void {
  this.mostrarTarjeta = !this.mostrarTarjeta;
  if (this.mostrarTarjeta) {
    this.mostrarVoucher = false;
  }
}

toggleVoucher(): void {
  this.mostrarVoucher = !this.mostrarVoucher;
  if (this.mostrarVoucher) {
    this.mostrarTarjeta = false;
  }
}
  cancelarPago(): void {
    this.isProcessingPayment = false;
    alert('Pago cancelado');
  }












// Métodos
onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    if (file.size <= 5 * 1024 * 1024) { // 5MB max
      this.voucherFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.voucherPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('El archivo no debe superar los 5MB');
    }
  }
}

onDragOver(event: DragEvent): void {
  event.preventDefault();
}

onDrop(event: DragEvent): void {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    this.onFileSelected({ target: { files: [file] } });
  }
}

removeFile(event: Event): void {
  event.stopPropagation();
  this.voucherFile = null;
  this.voucherPreview = null;
}

formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

copiarCuenta(texto: string): void {
  navigator.clipboard.writeText(texto).then(() => {
    // Puedes agregar un toast o mensaje de confirmación
    console.log('Copiado:', texto);
    alert('¡Número copiado al portapapeles!');
  });
}






// 🔥 MÉTODO ACTUALIZADO: enviarVoucher()
// 🔥 MÉTODO ACTUALIZADO: enviarVoucher()
enviarVoucher(): void {
    console.log('🔍 CARRITO AL MOMENTO DE ENVIAR:', this.carrito);
  console.log('🔍 ES ARRAY?:', Array.isArray(this.carrito));
  console.log('🔍 LONGITUD:', this.carrito?.length);
  // Validaciones
  if (!this.voucherFile) {
    alert('⚠️ Por favor sube tu comprobante de pago');
    return;
  }

  if (!this.clienteNombres.trim() || !this.clienteApellidos.trim()) {
    alert('⚠️ Por favor complete sus nombres y apellidos antes de continuar');
    return;
  }

  if (this.carrito.length === 0) {
    alert('⚠️ Tu carrito está vacío');
    return;
  }

  console.log('📤 === INICIANDO ENVÍO DE VOUCHER ===');
  console.log('👤 Cliente:', `${this.clienteNombres} ${this.clienteApellidos}`);
  console.log('📦 Items:', this.carrito.length);
  console.log('💰 Total:', this.total);

  this.isUploadingVoucher = true;

  // Primero guardar el envío
  this.envioService.guardarEnvio(this.envio).subscribe({
    next: (envioResponse) => {
      console.log('🚚 Envío registrado:', envioResponse);

      // ✅ DEBUG: Ver el carrito ANTES de mapear
      console.log('🛒 Carrito RAW:', this.carrito);
      
      // ✅ DEBUG: Ver el resultado del map
      const carritoMapeado = this.carrito.map(item => ({
        ProductoId: item.productId,
        NombreProducto: item.productName || 'Producto',
        Cantidad: item.quantity || 1,
        PrecioUnitario: this.calculateUnitPrice(item)
      }));
      
      console.log('🛒 Carrito mapeado:', carritoMapeado);

      // ✅ PRIMERO crear el JSON string
      const detallesJson = JSON.stringify(carritoMapeado);

      console.log('📨 Enviando voucher y venta al backend...');
      console.log('🔍 Detalles JSON COMPLETO:', detallesJson);
      console.log('🔍 Tipo:', typeof detallesJson);
      console.log('🔍 Primer carácter:', detallesJson[0]);
      console.log('🔍 Último carácter:', detallesJson[detallesJson.length - 1]);

      // ✅ LUEGO crear el FormData
const formData = new FormData();
formData.append('Voucher', this.voucherFile!);
formData.append('UserId', this.userId.toString());
formData.append('Total', this.total.toString());

// NumeroOperacion: nunca vacío
formData.append(
  'NumeroOperacion',
  this.numeroOperacion.trim() !== '' ? this.numeroOperacion.trim() : 'SIN-OPERACION'
);

formData.append('ClienteNombres', this.clienteNombres.trim());
formData.append('ClienteApellidos', this.clienteApellidos.trim());
formData.append('ClienteDNI', this.envio.dni || '');
formData.append('TipoComprobante', this.tipoComprobante);

// RUC solo real para factura, dummy para boleta
formData.append(
  'Ruc',
  this.tipoComprobante === 'factura' ? (this.datosFactura.ruc || '') : '00000000000'
);

// Razón social solo real para factura, genérica para boleta
formData.append(
  'RazonSocial',
  this.tipoComprobante === 'factura'
    ? (this.datosFactura.razonSocial || 'SIN RAZON SOCIAL')
    : 'CONSUMIDOR FINAL'
);

formData.append('Detalles', detallesJson);


      // ✅ DEBUG: Ver todo el FormData
      console.log('🔍 DEBUG - Contenido del FormData:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'Voucher') {
          console.log('Voucher: [File]', (pair[1] as File).name);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      // Enviar todo al backend
      this.ventaService.subirVoucherYRegistrarVenta(formData).subscribe({
        next: (response) => {
          console.log('✅ Voucher y venta registrados:', response);

          this.isUploadingVoucher = false;

          const ventaId = response.ventaId;

          // Limpiar carrito
          this.limpiarDespuesDeCompra();

          // Mensaje de éxito
          alert(`✅ ¡Comprobante recibido!\n\n` +
                `Pedido #${ventaId}\n` +
                `Total: S/ ${this.total.toFixed(2)}\n\n` +
                `📧 Se ha enviado un email de confirmación.\n` +
                `⏳ Tu pago será validado en 24-48 horas.\n` +
                `📄 Recibirás tu comprobante electrónico por email cuando se confirme.`);

          // Redirigir a página de éxito
          setTimeout(() => {
            this.router.navigate(['/user/pago-exitoso'], {
              queryParams: { 
                ventaId: ventaId,
                total: this.total,
                tipo: 'voucher'
              }
            });
          }, 2000);
        },
         error: (err) => {
    this.isUploadingVoucher = false;
    console.error('❌ Error al enviar voucher:', err);
    console.error('❌ Detalles del error (completos):', err.error);

    // 💥 NUEVO: ver qué campo del modelo falló
    const errors = err.error?.errors;
    if (errors) {
      console.group('🧩 Errores de validación del backend');
      Object.keys(errors).forEach(key => {
        console.error(`Campo "${key}":`, errors[key]);
      });
      console.groupEnd();
    }

    alert('❌ Error al procesar tu pago. Por favor intenta nuevamente.');
  }
});
    },
    error: (err) => {
      this.isUploadingVoucher = false;
      console.error('❌ Error al registrar envío:', err);
      alert('❌ Error al registrar el envío. Intenta nuevamente.');
    }
  });
}


}
