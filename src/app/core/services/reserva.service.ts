import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reserva, ReservaEstado } from '../../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/reservas';

  // Helpers de mapeo camelCase <-> snake_case
  private fromApi(api: any): Reserva {
    return {
      id: api.id,
      usuario_id: api.usuarioId ?? api.usuario_id,
      instalacion_id: api.instalacionId ?? api.instalacion_id,
      fecha_reserva: api.fechaReserva ?? api.fecha_reserva,
      hora_inicio: api.horaInicio ?? api.hora_inicio,
      hora_fin: api.horaFin ?? api.hora_fin,
      cantidad_personas: api.cantidadPersonas ?? api.cantidad_personas,
  // Normalizamos el estado a lowercase para evitar diferencias de casing/format entre backend y frontend
  estado: api.estado ? String(api.estado).toLowerCase() as ReservaEstado : undefined,
      motivo: api.motivo,
      observaciones: api.observaciones,
      precio_total: api.precioTotal ?? api.precio_total,
      costo_total: api.costoTotal ?? api.costo_total,
      fecha_creacion: api.fechaCreacion ?? api.fecha_creacion,
      fecha_actualizacion: api.fechaActualizacion ?? api.fecha_actualizacion,
      fecha_cancelacion: api.fechaCancelacion ?? api.fecha_cancelacion,
    };
  }

  private toApi(payload: Partial<Reserva>): any {
    // Para creación, el backend requiere: instalacionId, fechaReserva, horaInicio, horaFin
    // Construimos el body sólo con propiedades definidas para no enviar valores undefined
    const body: any = {};
    if (payload.instalacion_id != null) body.instalacionId = payload.instalacion_id;
    // Asociar la reserva al usuario (necesario para socios)
    if (payload.usuario_id != null) body.usuarioId = payload.usuario_id;
    if (payload.fecha_reserva) body.fechaReserva = payload.fecha_reserva;
    if (payload.hora_inicio) body.horaInicio = payload.hora_inicio;
    if (payload.hora_fin) body.horaFin = payload.hora_fin;

    // Campos opcionales que el backend puede aceptar
    if (payload.cantidad_personas != null) body.cantidadPersonas = payload.cantidad_personas;
    if (payload.motivo) body.motivo = payload.motivo;
    if (payload.observaciones) body.observaciones = payload.observaciones;
    if (payload.estado) body.estado = payload.estado;
    if (payload.precio_total != null) body.precioTotal = payload.precio_total;
    if (payload.costo_total != null) body.costoTotal = payload.costo_total;
    if (payload.fecha_cancelacion) body.fechaCancelacion = payload.fecha_cancelacion;

    return body;
  }

  getCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`).pipe(
      map((res: any) => typeof res === 'number' ? res : Number(res)),
      catchError(() => of(0))
    );
  }

  getAll(): Observable<Reserva[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((list) => list.map((r) => this.fromApi(r)))
    );
  }

  getById(id: number): Observable<Reserva> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((r) => this.fromApi(r)));
  }

  create(reserva: Partial<Reserva>): Observable<Reserva> {
    const body = this.toApi(reserva);
    return this.http.post<any>(this.baseUrl, body).pipe(map((r) => this.fromApi(r)));
  }

  update(id: number, reserva: Partial<Reserva>): Observable<Reserva> {
    const body = this.toApi(reserva);
    return this.http.put<any>(`${this.baseUrl}/${id}`, body).pipe(map((r) => this.fromApi(r)));
  }

  // No está especificado un update genérico en los endpoints; añadimos cancelar.
  cancel(id: number): Observable<Reserva> {
    return this.http.put<any>(`${this.baseUrl}/${id}/cancelar`, {}).pipe(map((r) => this.fromApi(r)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}