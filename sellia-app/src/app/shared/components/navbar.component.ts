import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-elegant sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <img src="/assets/logo.jpg" alt="Maison Recla" class="h-12 w-12 rounded-lg">
            <span class="text-2xl font-bold text-primary">Maison Recla</span>
          </div>

          <!-- Navigation Links -->
          <div *ngIf="authService.getCurrentUser() as user" class="hidden md:flex items-center space-x-8">
            <ng-container [ngSwitch]="user.role">
              <!-- Customer Links -->
              <ng-container *ngSwitchCase="'CUSTOMER'">
                <a routerLink="/menu" routerLinkActive="text-primary" class="text-dark hover:text-primary transition">Menu</a>
                <a routerLink="/orders" routerLinkActive="text-primary" class="text-dark hover:text-primary transition">My Orders</a>
              </ng-container>

              <!-- Admin/Staff Links -->
              <ng-container *ngSwitchDefault>
                <a routerLink="/dashboard" routerLinkActive="text-primary" class="text-dark hover:text-primary transition">Dashboard</a>
                <a routerLink="/orders" routerLinkActive="text-primary" class="text-dark hover:text-primary transition">Orders</a>
                <a *ngIf="isAdmin(user)" routerLink="/stock" routerLinkActive="text-primary" class="text-dark hover:text-primary transition">Stock</a>
                <a *ngIf="isAdmin(user)" routerLink="/reports" routerLinkActive="text-primary" class="text-dark hover:text-primary transition">Reports</a>
              </ng-container>
            </ng-container>
          </div>

          <!-- User Menu -->
          <div *ngIf="authService.getCurrentUser() as user" class="flex items-center space-x-4">
            <span class="text-sm text-neutral-600">{{ user.firstName }} {{ user.lastName }}</span>
            <button (click)="logout()" class="btn-outline text-sm py-2 px-4">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  authService = inject(AuthService);

  isAdmin(user: any): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  logout(): void {
    this.authService.logout();
  }
}
