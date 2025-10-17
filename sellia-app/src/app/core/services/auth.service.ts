import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthResponse, User } from '@shared/models/types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSignal = signal<boolean>(!!this.getToken());
  public isAuthenticated$ = this.isAuthenticatedSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
          this.saveUserToStorage(response.user);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSignal.set(true);
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/users/change-password`, { 
      currentPassword: oldPassword, 
      newPassword, 
      confirmPassword 
    }).pipe(
        tap(() => {
          console.log('Password changed successfully');
        }),
        catchError(error => {
          console.error('Password change error:', error);
          throw error;
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
          this.saveUserToStorage(response.user);
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string | string[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}
