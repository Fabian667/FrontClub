export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string; // ISO date string
  tipoCuenta?: string;
  tipoSocio?: 'titular' | 'familiar' | 'invitado';
  estado?: string;
  fotoPerfil?: string;
  token?: string;
  password?: string; // opcional para creación/actualización
}