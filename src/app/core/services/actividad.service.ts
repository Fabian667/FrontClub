import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Actividad } from '../../models/actividad.model';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/actividades';

  getAll(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.baseUrl).pipe(
      catchError(() => {
        // En errores (incluyendo 401/403), retornar lista vacía para no ensuciar la consola
        return of([] as Actividad[]);
      })
    );
  }

  getById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.post<Actividad>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}