import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PingService {
  /**
   * Envía una solicitud liviana al backend para mantenerlo activo.
   * Usa fetch con `no-cors` para evitar problemas de CORS en producción.
   */
  ping(): void {
    // Evitar pings en desarrollo para no generar ruido en consola/HMR.
    if (!environment.production) return;
    const url = this.getPingUrl();
    try {
      fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store'
      }).catch(() => {});
    } catch {
      // Silenciar cualquier error; el objetivo es sólo "despertar" el backend
    }
  }

  private getPingUrl(): string {
    const api = environment.apiUrl || '';
    if (/^https?:\/\//.test(api)) {
      try {
        const origin = new URL(api).origin;
        return origin + '/';
      } catch {
        return 'https://backclub.onrender.com/';
      }
    }
    // En desarrollo, apuntar explícitamente al origen público de Render
    if (api.startsWith('/api')) {
      return 'https://backclub.onrender.com/';
    }
    return 'https://backclub.onrender.com/';
  }
}