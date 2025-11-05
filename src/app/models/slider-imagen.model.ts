export type SliderSeccion = 'landing' | 'actividades' | 'instalaciones' | 'eventos' | 'noticias';

export interface SliderImagen {
  id?: number;
  titulo?: string;
  descripcion?: string;
  // URL de la imagen (obligatoria)
  imagen: string;
  // Enlace opcional al hacer click
  enlace?: string;
  // Sección donde se mostrará el slider
  seccion?: SliderSeccion;
  // Orden de aparición
  orden?: number;
  // Activo/inactivo
  activo?: boolean;
  // Vigencia
  fechaInicio?: string;        // YYYY-MM-DD
  fechaFin?: string;           // YYYY-MM-DD
  // Timestamps
  fechaCreacion?: string;      // ISO timestamp
  fechaActualizacion?: string; // ISO timestamp
}