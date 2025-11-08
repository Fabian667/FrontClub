import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { PingService } from './core/services/ping.service';
import { environment } from '../environments/environment';

function startPing(ping: PingService) {
  // Ejecutar inmediatamente y repetir cada 5 minutos
  return () => {
    try {
      ping.ping();
      setInterval(() => ping.ping(), 5 * 60 * 1000);
    } catch {}
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...(environment.production ? [provideBrowserGlobalErrorListeners()] : []),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]), withFetch()),
    { provide: APP_INITIALIZER, multi: true, useFactory: startPing, deps: [PingService] }
  ]
};
