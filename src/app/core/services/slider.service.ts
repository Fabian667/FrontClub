import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SliderImagen } from '../../models/slider-imagen.model';

@Injectable({ providedIn: 'root' })
export class SliderService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/sliders';

  // Mapeo tolerante camelCase <-> snake_case y variaciones de nombres
  private fromApi(api: any): SliderImagen {
    return {
      id: api.id,
      titulo: api.titulo,
      descripcion: api.descripcion,
      imagen: api.imagen ?? api.imagenUrl ?? api.imagen_url,
      enlace: api.enlace ?? api.link,
      seccion: api.seccion ?? api.section ?? api.ubicacion,
      orden: api.orden ?? api.order,
      activo: api.activo ?? api.active,
      fechaInicio: api.fechaInicio ?? api.fecha_inicio,
      fechaFin: api.fechaFin ?? api.fecha_fin,
      fechaCreacion: api.fechaCreacion ?? api.fecha_creacion,
      fechaActualizacion: api.fechaActualizacion ?? api.fecha_actualizacion,
    } as SliderImagen;
  }

  private toApi(model: Partial<SliderImagen>): any {
    return {
      id: model.id,
      titulo: model.titulo,
      descripcion: model.descripcion,
      imagen: model.imagen,
      enlace: model.enlace,
      seccion: model.seccion,
      orden: model.orden,
      activo: model.activo,
      fechaInicio: model.fechaInicio,
      fechaFin: model.fechaFin,
    };
  }

  getAll(): Observable<SliderImagen[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((list) => (Array.isArray(list) ? list.map((s) => this.fromApi(s)) : [])),
      catchError(() => of([] as SliderImagen[]))
    );
  }

  getActivos(): Observable<SliderImagen[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos`).pipe(
      map((list) => (Array.isArray(list) ? list.map((s) => this.fromApi(s)) : [])),
      catchError(() => of([] as SliderImagen[]))
    );
  }

  getById(id: number): Observable<SliderImagen> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((s) => this.fromApi(s)));
  }

  create(payload: Partial<SliderImagen>): Observable<SliderImagen> {
    const body = this.toApi(payload);
    return this.http.post<any>(this.baseUrl, body).pipe(map((s) => this.fromApi(s)));
  }

  update(id: number, payload: Partial<SliderImagen>): Observable<SliderImagen> {
    const body = this.toApi(payload);
    return this.http.put<any>(`${this.baseUrl}/${id}`, body).pipe(map((s) => this.fromApi(s)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}