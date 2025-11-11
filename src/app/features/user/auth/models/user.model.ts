export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}
