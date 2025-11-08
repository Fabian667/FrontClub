import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evento } from '../../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/eventos';

  private fromApi(api: any): Evento {
    return {
      id: api.id,
      nombre: api.nombre,
      descripcion: api.descripcion,
      fecha: api.fecha ?? null,
      horaInicio: api.horaInicio ?? api.hora_inicio ?? null,
      horaFin: api.horaFin ?? api.hora_fin ?? null,
      lugar: api.lugar ?? null,
      imagen: api.imagen ?? api.imagenUrl ?? api.imagen_url ?? null,
      costo: api.costo ?? null,
    } as Evento;
  }

  private toApi(model: Partial<Evento>): any {
    const body: any = {};
    if (model.nombre != null) body.nombre = model.nombre;
    if (model.descripcion != null) body.descripcion = model.descripcion;
    if (model.fecha != null) body.fecha = model.fecha;
    if (model.horaInicio != null) { body.horaInicio = model.horaInicio; body.hora_inicio = model.horaInicio; }
    if (model.horaFin != null) { body.horaFin = model.horaFin; body.hora_fin = model.horaFin; }
    if (model.lugar != null) body.lugar = model.lugar;
    if (model.imagen != null) { body.imagen = model.imagen; body.imagenUrl = model.imagen; body.imagen_url = model.imagen; }
    if (model.costo != null) body.costo = model.costo;
    return body;
  }

  getAll(): Observable<Evento[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((arr) => (Array.isArray(arr) ? arr.map((it) => this.fromApi(it)) : [])),
      catchError(() => of([] as Evento[]))
    );
  }

  getById(id: number): Observable<Evento> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((api) => this.fromApi(api)));
  }

  create(payload: Partial<Evento>): Observable<Evento> {
    return this.http.post<any>(this.baseUrl, this.toApi(payload)).pipe(map((api) => this.fromApi(api)));
  }

  update(id: number, payload: Partial<Evento>): Observable<Evento> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, this.toApi(payload)).pipe(map((api) => this.fromApi(api)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}