import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-neutral-800 border-b border-neutral-700 px-8 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-6">
        <button [routerLink]="['/admin/dashboard']" class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-primary hover:text-primary-dark transition-all duration-200 font-medium text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>← Retour</span>
        </button>
        <h1 class="text-xl font-bold text-white">Tableau de Bord</h1>
      </div>

      <div class="flex items-center space-x-6">
        <!-- Notifications -->
        <button class="relative text-neutral-400 hover:text-primary transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Menu -->
        <div class="flex items-center space-x-3 pl-6 border-l border-neutral-700">
          <div class="text-right">
            <p class="text-sm font-medium text-white">{{ currentUserName() }}</p>
            <p class="text-xs text-neutral-400">{{ currentUserRole() }}</p>
          </div>
          <button class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class AdminNavbarComponent {
  private authService = inject(AuthService);

  currentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Admin';
  }

  currentUserRole(): string {
    const user = this.authService.getCurrentUser();
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'CAISSE': 'Caissier',
      'CUISINE': 'Cuisinier'
    };
    return user ? roleMap[user.role] || user.role : 'Utilisateur';
  }
}
