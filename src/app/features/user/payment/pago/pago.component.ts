
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
  envioGasto: number = 15.00;
  mercadoPagoLoaded: boolean = false;
   isProcessingPayment: boolean = false;
  paymentBrickInitialized: boolean = false;
  metodoPago: string = 'tarjeta';
  tipoComprobante: string = 'boleta';
  

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
      private comprobanteService: ComprobanteService, // ✅ Agregado
    private ventaService: VentaService,
    private http: HttpClient,
    private router: Router
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
  
    iniciarCheckoutPro(): void {
    // Validaciones antes de procesar
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (this.total <= 0) {
      alert('El total debe ser mayor a 0');
      return;
    }

    if (this.isProcessingPayment) {
      return; // Evitar doble clic
    }

    this.isProcessingPayment = true;

    // Preparar items para Mercado Pago
    const items = this.carrito.map(item => ({
      title: item.productName || 'Producto',
      quantity: item.quantity || 1,
      unitPrice: this.calculateUnitPrice(item)
    }));

    // Agregar costo de envío como item separado
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
          // Guardar datos temporalmente antes de redirigir
          this.saveTemporaryData();
          
          // Redirigir a Mercado Pago (Sandbox)
          window.location.href = response.sandboxInitPoint;
        } else if (response?.initPoint) {
          // Producción
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
    // Guardar datos adicionales que podrían necesitarse al regresar
    const tempData = {
      userId: this.userId,
      carrito: this.carrito,
      total: this.total,
      envio: this.envio,
      tipoComprobante: this.tipoComprobante,
      datosFactura: this.datosFactura,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem('pagoTemporal', JSON.stringify(tempData));
  } 

    registrarVentaFinal(): void {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // ✅ Validar que se hayan ingresado nombres
    if (!this.clienteNombres.trim() || !this.clienteApellidos.trim()) {
      alert('Por favor complete sus nombres y apellidos');
      return;
    }

    console.log('🛒 === INICIANDO REGISTRO DE VENTA REAL ===');
    console.log('Carrito actual:', this.carrito);
    console.log('UserId:', this.userId);
    console.log('Total:', this.total);

    // 1️⃣ Guardar primero los datos de envío
    this.envioService.guardarEnvio(this.envio).subscribe({
      next: (envioResponse) => {
        console.log('🚚 Envío registrado correctamente:', envioResponse);

        // 2️⃣ Preparar la venta
        const venta: VentaCompletaRequest = {
          userId: this.userId,
          metodoPagoId: 3, // ID para Mercado Pago
          total: this.total,
          detalles: this.carrito.map(item => ({
            productoId: item.productId,
            nombreProducto: item.productName || 'Producto',
            cantidad: item.quantity || 1,
            precioUnitario: this.calculateUnitPrice(item)
          }))
        };

        console.log('💰 Datos de venta a enviar:', JSON.stringify(venta, null, 2));

        // 3️⃣ Registrar la venta
        this.ventaService.registrarVentaCompleta(venta).subscribe({
          next: (ventaResponse) => {
            console.log('🧾 Venta registrada correctamente:', ventaResponse);
            
            // ✅ Usar el ID real de la venta
            const ventaIdReal = ventaResponse.id || ventaResponse.ventaId;
            
            if (!ventaIdReal) {
              console.error('❌ No se obtuvo ID de la venta:', ventaResponse);
              alert('Error: No se pudo obtener el ID de la venta');
              return;
            }

            console.log(`💳 Usando ventaId real: ${ventaIdReal} para el comprobante`);

            // 4️⃣ Preparar datos del comprobante con datos reales
            const comprobanteData: ComprobanteRequest = {
              ventaId: ventaIdReal, // ✅ ID real de la venta
              tipoComprobante: this.tipoComprobante === 'boleta' ? 2 : 1,
              numeroForzado: 0,
              // ✅ Usar los campos del componente (no del modelo Envios)
              clienteDNI: this.envio.dni || '',
              clienteNombres: this.clienteNombres.trim() || 'Cliente',
              clienteApellidos: this.clienteApellidos.trim() || 'Apellido',
              // Campos para factura
              ruc: this.tipoComprobante === 'factura' ? this.datosFactura.ruc : '',
              razonSocial: this.tipoComprobante === 'factura' ? this.datosFactura.razonSocial : ''
            };

            console.log('📋 Datos del comprobante REAL a enviar:', JSON.stringify(comprobanteData, null, 2));

            // 5️⃣ Emitir comprobante con datos reales
            this.comprobanteService.emitirComprobante(comprobanteData).subscribe({
              next: (res: ComprobanteResponse) => {
  console.log('✅ Comprobante REAL emitido exitosamente:', res);

  const serie = res?.serie || res?.respuesta_nubefact?.serie || 'N/A';
  const numero = res?.numero || res?.respuesta_nubefact?.numero || 'N/A';

  const enlacePdf =
    res?.enlace_pdf ||
    res?.enlace_pdf ||
    res?.respuesta_nubefact?.enlace_del_pdf ||
    res?.respuesta_nubefact?.enlace ||
    null;

  console.log(`📄 Comprobante REAL - Serie: ${serie}, Número: ${numero}`);

  if (enlacePdf) {
    console.log('🔗 Abriendo PDF del comprobante real:', enlacePdf);
    setTimeout(() => {
      window.open(enlacePdf, '_blank');
    }, 300);
  } else {
    console.warn('⚠️ No se encontró enlace PDF en la respuesta:', res);
    alert('Comprobante emitido, pero no se encontró el enlace PDF.');
  }
                
                // Mostrar información del comprobante REAL
                const tipoDoc = this.tipoComprobante === 'boleta' ? 'Boleta' : 'Factura';
                const mensaje = `✅ ${tipoDoc} de tu compra emitida correctamente!\n` +
                               `Cliente: ${this.clienteNombres} ${this.clienteApellidos}\n` +
                               `Serie: ${serie}\n` +
                               `Número: ${numero}\n` +
                               `VentaID: ${ventaIdReal}`;
                
                alert(mensaje);
                
                // Limpiar carrito después de compra exitosa
                this.limpiarCarrito();
                
              },
              error: (err) => {
                console.error('❌ Error al emitir comprobante REAL:', err);
                alert(`❌ Error al emitir la ${this.tipoComprobante} de tu compra. La venta se registró correctamente.`);
              }
            });

            // 6️⃣ Limpiar datos temporales
            localStorage.removeItem('pagoTemporal');

            // 7️⃣ Redirigir
            setTimeout(() => {
              this.router.navigate(['/user/pago-exitoso'], {
                queryParams: { 
                  ventaId: ventaIdReal, 
                  total: this.total
                }
              });
            }, 2000);

          },
          error: (err) => {
            console.error('❌ Error completo al registrar venta:', err);
            alert('Error al finalizar la compra. Ver consola para más detalles.');
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al registrar envío:', err);
        alert('Error al registrar el envío. Intenta nuevamente.');
      }
    });
  }

  // ✅ Método para limpiar el carrito
  private limpiarCarrito(): void {
    this.cartService.limpiarCarrito(this.userId).subscribe({
      next: () => {
        console.log('🛒 Carrito limpiado después de compra exitosa');
        this.carrito = [];
        this.calcularTotales();
      },
      error: (err) => {
        console.error('⚠️ Error al limpiar carrito (no crítico):', err);
      }
    });
  }

  // ✅ Validación actualizada
  private validarDatosParaPago(): boolean {
    console.log('🔍 Validando datos para el pago...');
    
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return false;
    }
    
    if (this.total <= 0) {
      alert('El total debe ser mayor a 0');
      return false;
    }
    
    if (!this.envio.direccion || !this.envio.dni || !this.envio.telefono) {
      alert('Complete todos los datos de envío');
      return false;
    }
    
    // ✅ Validar nombres y apellidos del componente
    if (!this.clienteNombres.trim() || !this.clienteApellidos.trim()) {
      alert('Complete sus nombres y apellidos para continuar');
      return false;
    }
    
    if (this.tipoComprobante === 'factura') {
      if (!this.datosFactura.ruc || !this.datosFactura.razonSocial) {
        alert('Complete los datos de factura (RUC y Razón Social)');
        return false;
      }
      
      if (this.datosFactura.ruc.length !== 11 || !/^\d+$/.test(this.datosFactura.ruc)) {
        alert('El RUC debe tener exactamente 11 dígitos');
        return false;
      }
    }
    
    console.log('✅ Validación exitosa');
    console.log(`👤 Cliente: ${this.clienteNombres} ${this.clienteApellidos}`);
    return true;
  }

// ✅ Método de prueba - agrégalo temporalmente a tu componente
probarEmisionComprobante(): void {
  console.log('=== PRUEBA DE EMISIÓN DE COMPROBANTE ===');
  
  // Datos de prueba que coinciden con tu endpoint exitoso
  const comprobantePrueba: ComprobanteRequest = {
    ventaId: 87, // Usa un ID de venta existente
    tipoComprobante: 2, // 1 = Factura, 2 = Boleta
    numeroForzado: 0,
    clienteDNI: "44556677",
    clienteNombres: "Juan",
    clienteApellidos: "Pérez",
    ruc: "", // Vacío para boleta
    razonSocial: "" // Vacío para boleta
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
      console.error('Status:', err.status);
      console.error('Error body:', err.error);
      alert('❌ Prueba fallida! Ver consola para detalles.');
    }
  });
}

// ✅ Método para probar con factura
probarEmisionFactura(): void {
  const factoraPrueba: ComprobanteRequest = {
    ventaId: 87, // Usa un ID de venta existente
    tipoComprobante: 1, // 1 = Factura
    numeroForzado: 0,
    clienteDNI: "44556677",
    clienteNombres: "Juan",
    clienteApellidos: "Pérez",
    ruc: "20486608278", // RUC válido para factura
    razonSocial: "EMPRESA DE PRUEBA SAC"
  };

  this.comprobanteService.emitirComprobante(factoraPrueba).subscribe({
    next: (response) => {
      console.log('✅ FACTURA DE PRUEBA EMITIDA:', response);
      if (response?.enlace_pdf) window.open(response.enlace_pdf, '_blank');
      alert(`✅ Factura de prueba emitida!\nSerie: ${response.serie}\nNúmero: ${response.numero}`);
    },
    error: (err) => {
      console.error('❌ Error en factura de prueba:', err);
      alert('❌ Error en factura de prueba! Ver consola.');
    }
  });
}


   // 🧪 Método de prueba - agregar temporalmente al componente
  probarRegistroVenta(): void {
    console.log('=== INICIANDO PRUEBA DE REGISTRO DE VENTA ===');
    
    // Datos de prueba
    const ventaPrueba: VentaCompletaRequest = {
      userId: this.userId,
      metodoPagoId: 1, // Verifica que este ID exista en tu tabla MetodosPago
      total: 100.50,
      detalles: [
        {
          productoId: 1, // Asegúrate de que este producto exista
         
          cantidad: 2,
          precioUnitario: 50.25
        }
      ]
    };

    console.log('Datos de venta de prueba:', JSON.stringify(ventaPrueba, null, 2));
    console.log('URL del servicio:', this.ventaService['apiUrl'] + '/completa');

    this.ventaService.registrarVentaCompleta(ventaPrueba).subscribe({
      next: (response) => {
        console.log('✅ PRUEBA EXITOSA - Respuesta:', response);
        alert('Prueba exitosa! Ver consola para detalles.');
        
        // Probar navegación
        this.router.navigate(['/user/pago-exitoso'], {
          queryParams: { ventaId: response?.id || 'test', total: ventaPrueba.total }
        }).then(
          (success) => console.log('✅ Navegación exitosa:', success),
          (error) => console.error('❌ Error en navegación:', error)
        );
      },
      error: (err) => {
        console.error('❌ PRUEBA FALLIDA - Error completo:', err);
        console.error('Status:', err.status);
        console.error('StatusText:', err.statusText);
        console.error('Error body:', err.error);
        console.error('Headers:', err.headers);
        
        alert('Prueba fallida! Ver consola para detalles del error.');
      }
    });
  }

  // 🔍 Método para verificar datos antes del registro
  verificarDatosAntes(): void {
    console.log('=== VERIFICACIÓN DE DATOS ===');
    console.log('UserId:', this.userId);
    console.log('Carrito completo:', JSON.stringify(this.carrito, null, 2));
    console.log('Envío:', JSON.stringify(this.envio, null, 2));
    console.log('Total:', this.total);
    
    // Verificar que todos los productos tienen los campos necesarios
    const carritoValido = this.carrito.every(item => 
      item.productId && 
      item.productName && 
      item.quantity > 0 && 
      (item.totalPrice || 0) > 0
    );
    
    console.log('¿Carrito válido?:', carritoValido);
    
    if (!carritoValido) {
      console.error('❌ Carrito inválido - revisar estructura:');
      this.carrito.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          valido: !!(item.productId && item.productName && item.quantity > 0 && (item.totalPrice || 0) > 0)
        });
      });
    }
    
    // Verificar que el usuario esté autenticado
    const user = this.authService.getUser();
    console.log('Usuario autenticado:', user);
    console.log('¿UserId válido?:', this.userId > 0);
  }
simularRegresoDeMercadoPago(): void {
  // Simular que regresamos de Mercado Pago con pago exitoso
  this.router.navigate(['/user/pago-exitoso'], {
    queryParams: {
      payment_id: '1234567890',
      status: 'approved',
      merchant_order: '12345'
    }
  });
}
  
  // Método adicional para manejar casos donde el usuario regresa sin completar el pago
  cancelarPago(): void {
    this.isProcessingPayment = false;
    alert('Pago cancelado');
  }


  
  
  





}