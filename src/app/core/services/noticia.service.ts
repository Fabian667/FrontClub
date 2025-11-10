import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Noticia } from '../../models/noticia.model';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/noticias';

  private fromApi(api: any): Noticia {
    return {
      id: api.id,
      titulo: api.titulo,
      // Preferir nombres del contrato: contenido, imagen, fecha_publicacion
      descripcion: api.contenido ?? api.descripcion ?? api.description ?? undefined,
      fecha: api.fecha_publicacion ?? api.fecha ?? api.fechaPublicacion ?? undefined,
      imagenUrl: api.imagen ?? api.imagenUrl ?? api.imagen_url ?? undefined,
      subtitulo: api.subtitulo ?? undefined,
      autor: api.autor ?? undefined,
      destacada: api.destacada === undefined ? undefined : Boolean(api.destacada),
      estado: api.estado ?? undefined,
      editor: api.editor ?? undefined,
    };
  }

  private toApi(model: Partial<Noticia>): any {
    const body: any = {};
    if (model.id != null) body.id = model.id;
    if (model.titulo != null) body.titulo = String(model.titulo).trim();
    if (model.descripcion != null) body.contenido = String(model.descripcion).trim();
    if (model.fecha != null) body.fecha_publicacion = model.fecha;
    if (model.imagenUrl != null) body.imagen = model.imagenUrl;
    if (model.subtitulo != null) body.subtitulo = String(model.subtitulo).trim();
    if (model.autor != null) body.autor = String(model.autor).trim();
    if (model.destacada != null) body.destacada = !!model.destacada;
    if (model.estado != null) body.estado = model.estado;
    if (model.editor != null) body.editor = String(model.editor).trim();
    return body;
  }

  getAll(): Observable<Noticia[]> {
    // Cache-busting para evitar resultados stale en CDNs/navegadores
    const url = `${this.baseUrl}?ts=${Date.now()}`;
    return this.http.get<any[]>(url).pipe(
      map((list) => (Array.isArray(list) ? list.map((n) => this.fromApi(n)) : [])),
      catchError(() => of([] as Noticia[]))
    );
  }

  getById(id: number): Observable<Noticia> {
    const url = `${this.baseUrl}/${id}?ts=${Date.now()}`;
    return this.http.get<any>(url).pipe(map((api) => this.fromApi(api)));
  }

  create(payload: Partial<Noticia>): Observable<Noticia> {
    return this.http.post<any>(this.baseUrl, this.toApi(payload)).pipe(map((api) => this.fromApi(api)));
  }

  update(id: number, payload: Partial<Noticia>): Observable<Noticia> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, this.toApi(payload)).pipe(map((api) => this.fromApi(api)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}