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

    const normalizeDate = (value: any): string | undefined => {
      if (!value) return undefined;
      if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      const str = String(value);
      // Si ya viene YYYY-MM-DD, devolver tal cual
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
      // Intentar parsear y devolver YYYY-MM-DD
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return undefined;
    };

    const normalizeTime = (value: any): string | undefined => {
      if (!value) return undefined;
      if (value instanceof Date) {
        const hh = String(value.getHours()).padStart(2, '0');
        const mm = String(value.getMinutes()).padStart(2, '0');
        const ss = String(value.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }
      const str = String(value);
      // HH:mm:ss
      if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;
      // HH:mm -> añadir :00
      if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
      // Intentar parsear y devolver HH:mm:ss
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) {
        const hh = String(dt.getHours()).padStart(2, '0');
        const mm = String(dt.getMinutes()).padStart(2, '0');
        const ss = String(dt.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }
      return undefined;
    };

    const normalizeNumber = (value: any): number | undefined => {
      if (value == null || value === '') return undefined;
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(num) ? undefined : num;
    };
    if (payload.instalacion_id != null) {
      body.instalacionId = payload.instalacion_id;
      body.instalacion_id = payload.instalacion_id; // snake_case compat
    }
    // Asociar la reserva al usuario (necesario para socios)
    if (payload.usuario_id != null) {
      body.usuarioId = payload.usuario_id;
      body.usuario_id = payload.usuario_id; // snake_case compat
    }
    const fechaReservaStr = normalizeDate(payload.fecha_reserva);
    if (fechaReservaStr) {
      body.fechaReserva = fechaReservaStr;
      body.fecha_reserva = fechaReservaStr; // snake_case compat
    }
    const horaInicioStr = normalizeTime(payload.hora_inicio);
    if (horaInicioStr) {
      body.horaInicio = horaInicioStr;
      body.hora_inicio = horaInicioStr; // snake_case compat
    }
    const horaFinStr = normalizeTime(payload.hora_fin);
    if (horaFinStr) {
      body.horaFin = horaFinStr;
      body.hora_fin = horaFinStr; // snake_case compat
    }

    // Campos opcionales que el backend puede aceptar
    const cantidad = normalizeNumber(payload.cantidad_personas);
    if (cantidad != null) {
      body.cantidadPersonas = cantidad;
      body.cantidad_personas = cantidad;
    }
    if (payload.motivo) body.motivo = payload.motivo;
    if (payload.observaciones) body.observaciones = payload.observaciones;
    const estadoVal = payload.estado ?? 'pendiente';
    body.estado = estadoVal;
    const precioTotalNum = normalizeNumber(payload.precio_total);
    if (precioTotalNum != null) {
      body.precioTotal = precioTotalNum;
      body.precio_total = precioTotalNum;
    }
    const costoTotalNum = normalizeNumber(payload.costo_total);
    if (costoTotalNum != null) {
      body.costoTotal = costoTotalNum;
      body.costo_total = costoTotalNum;
    }
    if (payload.fecha_cancelacion) {
      body.fechaCancelacion = payload.fecha_cancelacion;
      body.fecha_cancelacion = payload.fecha_cancelacion;
    }

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