import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: any) => {
      try {
        const url = req.url || '';
        const isAuth = url.includes('/auth/login') || url.includes('/auth/me') || url.includes('/auth/register');
        if (isAuth) {
          const status = err?.status;
          const statusText = err?.statusText;
          const message = err?.error?.message || err?.message;
          console.error('HTTP error', { url, status, statusText, message, body: err?.error });
        }
      } catch {}
      throw err;
    })
  );
};