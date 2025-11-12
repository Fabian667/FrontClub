import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Instalacion } from '../../models/instalacion.model';

@Injectable({ providedIn: 'root' })
export class InstalacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/instalaciones';

  private fromApi(api: any): Instalacion {
    return {
      id: api.id,
      nombre: api.nombre,
      descripcion: api.descripcion,
      tipo: api.tipo ?? null,
      capacidadMaxima: api.capacidadMaxima ?? api.capacidad_maxima ?? null,
      precioHora: api.precioHora ?? api.precio_hora ?? null,
      estado: api.estado,
      requiereAprobacion: api.requiereAprobacion ?? api.requiere_aprobacion ?? false,
      foto: api.foto ?? null,
      // Enlace/URL opcional
      url: api.url ?? api.enlace ?? null,
      // Compatibilidad con UI previa
      capacidad: api.capacidad ?? api.capacidadMaxima ?? api.capacidad_maxima ?? null,
      imagen: (api.foto ?? api.imagen ?? api.imagenUrl ?? api.imagen_url ?? null),
    } as Instalacion;
  }

  private toApi(model: Partial<Instalacion>): any {
    const body: any = {};
    if (model.nombre != null) body.nombre = model.nombre;
    if (model.descripcion != null) body.descripcion = model.descripcion;
    if (model.tipo != null) body.tipo = model.tipo;
    if (model.capacidadMaxima != null) {
      body.capacidadMaxima = model.capacidadMaxima;
      body.capacidad_maxima = model.capacidadMaxima;
    } else if (model.capacidad != null) {
      body.capacidadMaxima = model.capacidad;
      body.capacidad_maxima = model.capacidad;
    }
    if (model.precioHora != null) {
      body.precioHora = model.precioHora;
      body.precio_hora = model.precioHora;
    }
    if (model.estado != null) body.estado = model.estado;
    if (model.requiereAprobacion != null) {
      body.requiereAprobacion = model.requiereAprobacion;
      body.requiere_aprobacion = model.requiereAprobacion;
    }
    if (model.foto != null) body.foto = model.foto;
    if (model.url != null) {
      // Mapear a posibles nombres de campo del backend
      body.url = model.url;
      body.enlace = model.url;
    }
    return body;
  }

  getAll(): Observable<Instalacion[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((arr) => (Array.isArray(arr) ? arr.map((it) => this.fromApi(it)) : [])),
      catchError(() => of([] as Instalacion[]))
    );
  }

  getById(id: number): Observable<Instalacion> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((api) => this.fromApi(api)));
  }

  create(payload: Partial<Instalacion>): Observable<Instalacion> {
    return this.http
      .post<any>(this.baseUrl, this.toApi(payload))
      .pipe(map((api) => this.fromApi(api)));
  }

  update(id: number, payload: Partial<Instalacion>): Observable<Instalacion> {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, this.toApi(payload))
      .pipe(map((api) => this.fromApi(api)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}