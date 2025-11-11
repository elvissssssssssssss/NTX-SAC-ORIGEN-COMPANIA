// src/app/core/models/product.model.ts

export interface DataHttp {
  data: Product[];
  success: boolean;
  message: string;
  errors?: string[];
}

export interface Product {
  id: number;
  nombre: string;
  description: string;
  marca: string;
  color: string;
  precio: number;
  precioDescuento?: number | null; // 使用可选字段和 null
  stock: number;
  talla: string;
  code: string;
  imagen: string;
  imagen2?: string | null; // 使用可选字段和 null
  imagen3?: string | null; // 使用可选字段和 null
   estado?: boolean; // Asegúrate de que esta propiedad existe
  categoria: string;
  createdAt: string;
  updatedAt: string;
}