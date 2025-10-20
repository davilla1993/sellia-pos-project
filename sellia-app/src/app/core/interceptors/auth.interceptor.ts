import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private publicRoutes = [
    '/api/public/menu',
    '/api/public/orders',
    '/api/public/health'
  ];

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // Vérifier si c'est une route publique
    const isPublicRoute = this.publicRoutes.some(route => request.url.includes(route));
    
    if (isPublicRoute) {
      // Ne pas ajouter le token pour les routes publiques
      return next.handle(request);
    }

    // Pour les autres routes, ajouter le token JWT
    const authToken = localStorage.getItem('auth_token');
    
    if (authToken && !this.isTokenExpired(authToken)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(request);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.parseJwt(token);
      if (!decoded.exp) {
        return false;
      }
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  }
}
