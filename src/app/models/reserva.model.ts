export type ReservaEstado = 'reservada' | 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Reserva {
  id: number;
  usuario_id: number;
  instalacion_id?: number;
  fecha_reserva: string; // YYYY-MM-DD
  hora_inicio?: string;  // HH:mm
  hora_fin?: string;     // HH:mm
  cantidad_personas?: number;
  estado?: ReservaEstado;
  motivo?: string;
  observaciones?: string;
  precio_total?: number; // decimal(10,2)
  costo_total?: number;  // decimal(38,2)
  fecha_creacion?: string;      // ISO timestamp
  fecha_actualizacion?: string; // ISO timestamp
  fecha_cancelacion?: string;   // ISO datetime
}