import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Informacion } from '../../models/informacion.model';

@Injectable({ providedIn: 'root' })
export class InformacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/informacion';

  private fromApi(api: any): Informacion {
    return {
      id: api.id,
      nombreClub: api.nombreClub ?? api.nombre_club,
      descripcion: api.descripcion,
      email: api.email,
      telefono: api.telefono,
      telefonoAlternativo: api.telefonoAlternativo ?? api.telefono_alternativo ?? null,
      whatsapp: api.whatsapp,
      direccion: api.direccion,
      ciudad: api.ciudad,
      provincia: api.provincia,
      codigoPostal: api.codigoPostal ?? api.codigo_postal,
      horarioAtencion: api.horarioAtencion ?? api.horario_atencion,
      facebook: api.facebook,
      instagram: api.instagram,
      twitter: api.twitter ?? null,
      youtube: api.youtube ?? null,
      tiktok: api.tiktok ?? null,
      linkedin: api.linkedin ?? null,
      website: api.website,
      logo: api.logo,
      imagenPrincipal: api.imagenPrincipal ?? api.imagen_principal,
      imagenGaleria1: api.imagenGaleria1 ?? api.imagen_galeria_1 ?? null,
      imagenGaleria2: api.imagenGaleria2 ?? api.imagen_galeria_2 ?? null,
      imagenGaleria3: api.imagenGaleria3 ?? api.imagen_galeria_3 ?? null,
      imagenGaleria4: api.imagenGaleria4 ?? api.imagen_galeria_4 ?? null,
      imagenGaleria5: api.imagenGaleria5 ?? api.imagen_galeria_5 ?? null,
      mapaLatitud: api.mapaLatitud ?? api.mapa_latitud ?? null,
      mapaLongitud: api.mapaLongitud ?? api.mapa_longitud ?? null,
      fundacion: api.fundacion ?? null,
      mision: api.mision ?? null,
      vision: api.vision ?? null,
      fechaActualizacion: api.fechaActualizacion ?? api.fecha_actualizacion ?? null,
    };
  }

  private toApi(model: Partial<Informacion>): any {
    return {
      id: model.id,
      nombre_club: model.nombreClub,
      descripcion: model.descripcion,
      email: model.email,
      telefono: model.telefono,
      telefono_alternativo: model.telefonoAlternativo,
      whatsapp: model.whatsapp,
      direccion: model.direccion,
      ciudad: model.ciudad,
      provincia: model.provincia,
      codigo_postal: model.codigoPostal,
      horario_atencion: model.horarioAtencion,
      facebook: model.facebook,
      instagram: model.instagram,
      twitter: model.twitter,
      youtube: model.youtube,
      tiktok: model.tiktok,
      linkedin: model.linkedin,
      website: model.website,
      logo: model.logo,
      imagen_principal: model.imagenPrincipal,
      imagen_galeria_1: model.imagenGaleria1,
      imagen_galeria_2: model.imagenGaleria2,
      imagen_galeria_3: model.imagenGaleria3,
      imagen_galeria_4: model.imagenGaleria4,
      imagen_galeria_5: model.imagenGaleria5,
      mapa_latitud: model.mapaLatitud,
      mapa_longitud: model.mapaLongitud,
      fundacion: model.fundacion,
      mision: model.mision,
      vision: model.vision,
      fecha_actualizacion: model.fechaActualizacion,
    };
  }

  getAll(): Observable<Informacion[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((list) => (Array.isArray(list) ? list.map((i) => this.fromApi(i)) : [])),
      catchError(() => of([] as Informacion[]))
    );
  }

  getById(id: number): Observable<Informacion> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((i) => this.fromApi(i)));
  }

  create(payload: Partial<Informacion>): Observable<Informacion> {
    return this.http.post<any>(this.baseUrl, this.toApi(payload)).pipe(map((i) => this.fromApi(i)));
  }

  update(id: number, payload: Partial<Informacion>): Observable<Informacion> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, this.toApi(payload)).pipe(map((i) => this.fromApi(i)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}