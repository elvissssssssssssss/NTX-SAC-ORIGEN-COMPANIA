// cart.model.ts
// src/app/features/user/cart/models/cart.model.ts

// src/app/features/user/cart/models/cart.model.ts

export interface CartItem {
  id?: number;
  userId: number;
  productId: number;
  talla: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
  productImage?: string;
  productDescription?: string;
  productPrice?: number;
  productStock?: number;
  totalPrice?: number;
    color?: string;
  precioDescuento?: number;
}

// 👇 NUEVA interfaz para la respuesta de la API
export interface CartResponse {
  totalItems: number;
  subTotal: number;
  
  tax: number;
  total: number;
  items: CartItem[];
}
