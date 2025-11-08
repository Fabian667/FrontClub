import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  register(payload: { nombre: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}