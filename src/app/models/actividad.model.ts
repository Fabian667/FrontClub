export interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  diaSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  precioHora?: number;
}