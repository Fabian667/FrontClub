import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/auth';

  login(credentials: { email: string; password: string }): Observable<any> {
    const payload = {
      email: credentials.email,
      password: credentials.password
    };
    // Usar la versión simplificada (como en GitHub): devolver solo el cuerpo JSON con { token, ... }
    return this.http.post(`${this.baseUrl}/login`, payload);
  }

  register(payload: { nombre: string; apellido?: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  // Variante que ignora abortos de navegación y status 0 (ruido en dev)
  meSilenced(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`).pipe(
      catchError((err: any) => {
        const isAborted = (err?.name === 'AbortError') || (typeof err?.message === 'string' && err.message.includes('ERR_ABORTED'));
        const status = err?.status;
        if (isAborted || status === 0) return of(null);
        throw err;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}