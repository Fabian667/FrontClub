import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return router.parseUrl('/admin/login');
  }

  // Validar el token con /auth/me antes de permitir acceso y restringir por rol
  return auth.me().pipe(
    map((me: any) => {
      const tipo = me?.tipoCuenta || me?.tipo || localStorage.getItem('role');
      const isSocio = (tipo === 'socio');
      const url = state.url || '';
      const isAdminArea = url.startsWith('/admin');
      const isSocioAllowed = url.startsWith('/admin/reservas') || url === '/admin' || url === '/admin/';

      if (isAdminArea && isSocio && !isSocioAllowed) {
        return router.parseUrl('/admin/reservas');
      }
      return true;
    }),
    catchError(() => of(router.parseUrl('/admin/login')))
  );
};