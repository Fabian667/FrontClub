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
    // Enviamos el payload en camelCase y sólo con propiedades definidas,
    // consistente con el resto de servicios del proyecto.
    const body: any = {};
    if (model.id != null) body.id = model.id;
    if (model.nombreClub != null) body.nombreClub = model.nombreClub;
    if (model.descripcion != null) body.descripcion = model.descripcion;
    if (model.email != null) body.email = model.email;
    if (model.telefono != null) body.telefono = model.telefono;
    if (model.telefonoAlternativo != null) body.telefonoAlternativo = model.telefonoAlternativo;
    if (model.whatsapp != null) body.whatsapp = model.whatsapp;
    if (model.direccion != null) body.direccion = model.direccion;
    if (model.ciudad != null) body.ciudad = model.ciudad;
    if (model.provincia != null) body.provincia = model.provincia;
    if (model.codigoPostal != null) body.codigoPostal = model.codigoPostal;
    if (model.horarioAtencion != null) body.horarioAtencion = model.horarioAtencion;
    if (model.facebook != null) body.facebook = model.facebook;
    if (model.instagram != null) body.instagram = model.instagram;
    if (model.twitter != null) body.twitter = model.twitter;
    if (model.youtube != null) body.youtube = model.youtube;
    if (model.tiktok != null) body.tiktok = model.tiktok;
    if (model.linkedin != null) body.linkedin = model.linkedin;
    if (model.website != null) body.website = model.website;
    if (model.logo != null) body.logo = model.logo;
    if (model.imagenPrincipal != null) body.imagenPrincipal = model.imagenPrincipal;
    if (model.imagenGaleria1 != null) body.imagenGaleria1 = model.imagenGaleria1;
    if (model.imagenGaleria2 != null) body.imagenGaleria2 = model.imagenGaleria2;
    if (model.imagenGaleria3 != null) body.imagenGaleria3 = model.imagenGaleria3;
    if (model.imagenGaleria4 != null) body.imagenGaleria4 = model.imagenGaleria4;
    if (model.imagenGaleria5 != null) body.imagenGaleria5 = model.imagenGaleria5;
    if (model.mapaLatitud != null) body.mapaLatitud = model.mapaLatitud;
    if (model.mapaLongitud != null) body.mapaLongitud = model.mapaLongitud;
    if (model.fundacion != null) body.fundacion = model.fundacion;
    if (model.mision != null) body.mision = model.mision;
    if (model.vision != null) body.vision = model.vision;
    if (model.fechaActualizacion != null) body.fechaActualizacion = model.fechaActualizacion;
    return body;
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