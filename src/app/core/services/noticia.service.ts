import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Noticia } from '../../models/noticia.model';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/noticias';

  getAll(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.baseUrl).pipe(
      catchError(() => of([] as Noticia[]))
    );
  }

  getById(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Noticia>): Observable<Noticia> {
    return this.http.post<Noticia>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Noticia>): Observable<Noticia> {
    return this.http.put<Noticia>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}