import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Instalacion } from '../../models/instalacion.model';

@Injectable({ providedIn: 'root' })
export class InstalacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/instalaciones';

  getAll(): Observable<Instalacion[]> {
    return this.http.get<Instalacion[]>(this.baseUrl).pipe(
      catchError(() => {
        // En errores (incluyendo 401/403), retornar lista vacía para no ensuciar la consola
        return of([] as Instalacion[]);
      })
    );
  }

  getById(id: number): Observable<Instalacion> {
    return this.http.get<Instalacion>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Instalacion>): Observable<Instalacion> {
    return this.http.post<Instalacion>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Instalacion>): Observable<Instalacion> {
    return this.http.put<Instalacion>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}