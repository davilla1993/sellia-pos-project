import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

const publicUrls = ['/auth/login', '/auth/public', '/health', '/api/auth', '/api/public'];

function isPublicUrl(url: string): boolean {
  return publicUrls.some(publicUrl => url.includes(publicUrl));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
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
          const errorMessage = error.error?.message || error.message || '';

          // Check if token has been revoked (new login detected)
          if (errorMessage.toLowerCase().includes('token') &&
              (errorMessage.toLowerCase().includes('revoked') ||
               errorMessage.toLowerCase().includes('révoqué'))) {
            console.warn('Token revoked - Another session detected');

            // Clear session and redirect to login with specific message
            authService.logout();

            // Store message for login page to display
            sessionStorage.setItem('logoutReason', 'session_revoked');

            return throwError(() => new Error('Your session has been revoked because a new login was detected from another device or browser.'));
          } else {
            // Generic 401 - Token expired or invalid
            console.warn('Unauthorized - Token expired or invalid');
            authService.logout();
          }

          return throwError(() => error);
        }
      }
      return throwError(() => error);
    })
  );
};
