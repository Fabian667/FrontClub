import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Actividad } from '../../models/actividad.model';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/actividades';

  private fromApi(api: any): Actividad {
    return {
      id: api.id,
      nombre: api.nombre,
      descripcion: api.descripcion,
      diaSemana: api.diaSemana ?? api.dia_semana ?? null,
      horaInicio: api.horaInicio ?? api.hora_inicio ?? null,
      horaFin: api.horaFin ?? api.hora_fin ?? null,
      precioHora: api.precioHora ?? api.precio_hora ?? null,
    } as Actividad;
  }

  private toApi(model: Partial<Actividad>): any {
    const body: any = {};
    if (model.nombre != null) body.nombre = model.nombre;
    if (model.descripcion != null) body.descripcion = model.descripcion;
    if (model.diaSemana != null) {
      body.diaSemana = model.diaSemana;
      body.dia_semana = model.diaSemana;
    }
    if (model.horaInicio != null) {
      body.horaInicio = model.horaInicio;
      body.hora_inicio = model.horaInicio;
    }
    if (model.horaFin != null) {
      body.horaFin = model.horaFin;
      body.hora_fin = model.horaFin;
    }
    if (model.precioHora != null) {
      body.precioHora = model.precioHora;
      body.precio_hora = model.precioHora;
    }
    return body;
  }

  getAll(): Observable<Actividad[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((arr) => (Array.isArray(arr) ? arr.map((it) => this.fromApi(it)) : [])),
      catchError(() => of([] as Actividad[]))
    );
  }

  getById(id: number): Observable<Actividad> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((api) => this.fromApi(api)));
  }

  create(payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.post<any>(this.baseUrl, this.toApi(payload)).pipe(map((api) => this.fromApi(api)));
  }

  update(id: number, payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, this.toApi(payload)).pipe(map((api) => this.fromApi(api)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}