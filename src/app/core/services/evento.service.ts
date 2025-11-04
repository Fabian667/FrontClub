import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evento } from '../../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/eventos';

  getAll(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.baseUrl).pipe(
      catchError(() => {
        // En errores (incluyendo 401/403), retornar lista vacía para no ensuciar la consola
        return of([] as Evento[]);
      })
    );
  }

  getById(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Evento>): Observable<Evento> {
    return this.http.post<Evento>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}