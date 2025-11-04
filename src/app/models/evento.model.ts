export interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  lugar?: string;
  imagen?: string;
}