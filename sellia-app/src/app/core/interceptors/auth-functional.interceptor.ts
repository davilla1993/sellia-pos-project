import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

const publicUrls = ['/auth/login', '/auth/public', '/health', '/api/auth', '/api/public'];

function isPublicUrl(url: string): boolean {
  return publicUrls.some(publicUrl => url.includes(publicUrl));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token && !isPublicUrl(req.url)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !isPublicUrl(error.url || '')) {
          authService.logout();
          return throwError(() => error);
        }
      }
      return throwError(() => error);
    })
  );
};
