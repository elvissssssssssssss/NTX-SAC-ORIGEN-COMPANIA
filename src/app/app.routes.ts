import { Routes } from '@angular/router';
import { userAuthGuard } from './core/guards/user-auth-guard'; // Asegúrate de que exista y esté bien escrito
import { UserLayoutComponent } from './layout/user-layout/user-layout.component';
import { AuthGuard } from './core/guards/admin-auth-guard';

export const routes: Routes = [
  // Redirección por defecto
  { path: '', redirectTo: '/mujer', pathMatch: 'full' },

  // 🔐 RUTAS DE AUTENTICACIÓN DE USUARIOS (CLIENTES)
 {
    path: 'auth',
    component: UserLayoutComponent, // Aplica layout con header/footer a login y register
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/user/auth/user-login/user-login.component')
            .then(m => m.UserLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/user/auth/user-register/user-register.component')
            .then(m => m.UserRegistercomponent)
      }
    ]
  },

  // 👤 RUTA DE PERFIL (protegida con guard opcional)
  {
    path: 'user',
    component: UserLayoutComponent,
    children: [
      {
        path: 'profile',
        canActivate: [userAuthGuard], // opcional si deseas proteger
        loadComponent: () =>
          import('./features/user/auth/profile/perfil.component')
            .then(m => m.PerfilComponent)
      },
      {
  path: 'envio',
  loadComponent: () => import('./features/user/shipping/pages/shipping-form.component')
  .then(m => m.ShippingFormComponent)
},
 {
  path: 'pago',
  loadComponent: () =>
    import('./features/user/payment/pago/pago.component')
      .then(m => m.PagoComponent)
},
{
  path: 'pago-exitoso',
  loadComponent: () =>
    import('./features/user/payment/pago-exitoso/pago-exitoso.component')
      .then(m => m.PagoExitosocomponent)
},

    ]
  },

  

  // 🛍️ RUTAS DE USUARIO / CLIENTE (CON LAYOUT)
  {
    path: '',
        loadComponent: () =>
      import('./layout/user-layout/user-layout.component')
        .then(m => m.UserLayoutComponent),
    children: [
 
      {
        path: 'mujer',
        loadComponent: () =>
          import('./features/user/home/mujer/mujer.component')
            .then(m => m.MujerComponent)
      },
      {
        path: 'soporte',
        loadComponent: () =>
          import('./features/user/home/hombre/hombre.component')
            .then(m => m.HombreComponent)
      },
        // 👩 Rutas por categoría - Mujer
      {
        path: 'mujer/uniformes-deportivas',
        loadComponent: () =>
          import('./features/user/categorias/mujer/novedades/mujer-novedades/mujer-novedades.component')
            .then(m => m.MujerNovedadesComponent)
      },
      {
        path: 'mujer/ropa-corporativa',
        loadComponent: () =>
          import('./features/user/categorias/mujer/ropa-corporativa/mujer-ropa-corporativa/mujer-ropa-corporativa.component')
            .then(m => m.MujerRopaCorporativacomponent)
      },

      // 👨 Rutas por categoría - Hombre
      {
        path: 'hombre/novedades',
        loadComponent: () =>
          import('./features/user/categorias/hombre/novedades/hombre-novedades/hombre-novedades.component')
            .then(m => m.HombreNovedadescomponent)
      },
      {
        path: 'hombre/ntx-prom',
        loadComponent: () =>
          import('./features/user/categorias/hombre/ntx-prom/hombre-ntx-prom/hombre-ntx-prom.component')
            .then(m => m.HombreNtxPromcomponent)
      },
      


      {
          path: 'producto/:id',
        loadComponent: () =>
          import('./features/user/shop/producto-detalle/producto-detalle.component')
            .then(m => m.ProductoDetalleComponent),
       
      },

      {
  path: 'carrito',
  loadComponent: () => 
    import('./features/user/cart/pages/cart/cart.component')
  .then(m => m.CartComponent)
},

      {
  path: 'sobre-nosotros',
  loadComponent: () => 
    import('./features/user/home/sobreNtx/nosotros/nosotros.component')
  .then(m => m.nosotroscomponent)
},

      {
  path: 'contacto',
  loadComponent: () => 
    import('./features/user/home/sobreNtx/contacto/contacto.component')
  .then(m => m.contactocomponent)
}

      
   

           /*
      {
              path: 'producto/:id',
              loadComponent: () =>
                import('./features/user/product-detail/product-detail.component')
                  .then(m => m.ProductDetailComponent)
            },
            {
              path: 'carrito',
              loadComponent: () =>
                import('./features/user/cart/cart.component')
                  .then(m => m.CartComponent)
            },
            {
              path: 'checkout',
              loadComponent: () =>
                import('./features/user/checkout/checkout.component')
                  .then(m => m.CheckoutComponent),
              canActivate: [userAuthGuard]
            },
            {
              path: 'mi-cuenta',
              loadComponent: () =>
                import('./features/user/account/account.component')
                  .then(m => m.AccountComponent),
              canActivate: [userAuthGuard]
            },
            {
              path: 'mis-pedidos',
              loadComponent: () =>
                import('./features/user/orders/orders.component')
                  .then(m => m.OrdersComponent),
              canActivate: [userAuthGuard]
            } */
    ]
  },


  // ⚙️ RUTAS DE ADMINISTRADOR
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/admin/auth/admin-login/admin-login.component')
            .then(m => m.AdminLoginComponent)
      },
      
    // 🔐 Sección protegida
    {
      path: '',
      loadComponent: () =>
        import('./layout/admin-layout/admin-layout.component')
          .then(m => m.AdminLayoutComponent),
      canActivate: [AuthGuard], // 🔒 Aquí aplicamos el guard
      children: [
        {
          path: 'dashboard',
          loadComponent: () =>
            import('./features/admin/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
        },
        {
          path: 'mantenimiento/producto',
          loadComponent: () =>
            import('./features/admin/products/product-list/product-list.component')
              .then(m => m.ProductListComponent)
        },
        {
          path: 'mantenimiento/products/edit/:id',
          loadComponent: () =>
            import('./features/admin/products/product-edit/product-edit.component')
              .then(m => m.ProductEditComponent)
        },
        {
          path: 'mantenimiento/products/create',
          loadComponent: () =>
            import('./features/admin/products/product-create/product-create.component')
              .then(m => m.ProductCreateComponent)
        },
        {
          path: 'clientes',
          loadComponent: () =>
            import('./features/admin/clientes/clientes.component')
              .then(m => m.ClientesComponent)
        },
        {
  path: 'ventas',
  loadComponent: () =>
    import('./features/admin/ventas/ventas.component')
      .then(m => m.VentasComponent)
},
{
  path: 'enivioAdmin',
  loadComponent: () =>
    import('./features/admin/envios/envios.component')
      .then(m => m.Envioscomponent)
}
,
{
  path: 'atencionClienteadmin',
  loadComponent: () =>
    import('./features/admin/atencionCliente/atencionCliente.component')
      .then(m => m.atencionClienteComponent)
}
,
{
  path: 'roles',
  loadComponent: () =>
    import('./features/admin/roles/roles-list/roles-list.component')
      .then(m => m.RolesListComponent)
},
{
  path: 'roles/create',
  loadComponent: () =>
    import('./features/admin/roles/roles-create/roles-create.component')
      .then(m => m.RolesCreateComponent)
},
{
  path: 'usuarios',
  loadComponent: () =>
    import('./features/admin/usuarios/usuarios-list/usuarios-list.component')
      .then(m => m.UsuariosListComponent)
},
{
  path: 'usuarios/create',
  loadComponent: () =>
    import('./features/admin/usuarios/usuarios-create/usuarios-create.component')
      .then(m => m.UsuariosCreateComponent)
}
,

        // Redirección por defecto
        {
          path: '',
          redirectTo: 'dashboard',
          pathMatch: 'full'
        },



          
        ]
      }
    ]
  },

  // 🚫 RUTA 404 - Página no encontrada
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent)
  }
];
