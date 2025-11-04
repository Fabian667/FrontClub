export interface Instalacion {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad?: number;
  estado?: string;
  imagen?: string;
}