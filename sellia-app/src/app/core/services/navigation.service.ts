import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isCaissier(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'CAISSE';
  }

  isCuisine(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'CUISINE';
  }

  getBackNavigationPath(): string {
    if (this.isAdmin()) {
      return '/admin/dashboard';
    }
    return '/';
  }

  navigateBack(): void {
    this.router.navigate([this.getBackNavigationPath()]);
  }

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role ?? 'USER';
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? 'User';
  }
}
