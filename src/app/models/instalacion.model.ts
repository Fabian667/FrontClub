export type InstalacionEstado = 'ACTIVA' | 'INACTIVA';

export interface Instalacion {
  id: number;
  nombre: string;
  descripcion: string;
  // Compatibilidad con UI previa
  capacidad?: number;
  imagen?: string;
  estado?: InstalacionEstado | string;
  // Campos según contrato backend
  tipo?: string;
  capacidadMaxima?: number;
  precioHora?: number;
  // Enlace/URL opcional asociado a la instalación
  url?: string;
  // Nuevos campos según tabla: requiere_aprobacion, foto
  requiereAprobacion?: boolean;
  foto?: string;
}