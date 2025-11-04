import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const url = req.url || '';
  const isAuthLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');

  if (token && !isAuthLoginOrRegister) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};