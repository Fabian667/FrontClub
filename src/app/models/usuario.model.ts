export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  tipoCuenta?: string;
  estado?: string;
  token?: string;
  password?: string; // opcional para creación/actualización
}