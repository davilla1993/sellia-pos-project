import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar-simple',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white shadow-elegant sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <img src="/assets/logo.jpg" alt="Maison Recla" class="h-12 w-12 rounded-lg">
            <span class="text-2xl font-bold text-primary">Maison Recla</span>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-4">
            <a routerLink="/customer/menu" class="text-dark hover:text-primary">Menu</a>
            <button (click)="logout()" class="btn-outline text-sm py-2 px-4">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarSimpleComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
