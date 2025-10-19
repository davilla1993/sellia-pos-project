import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="flex h-screen w-screen bg-neutral-900 overflow-hidden fixed top-0 left-0">
      <!-- LEFT: Navigation Sidebar -->
      <div class="w-64 bg-neutral-800 border-r border-neutral-700 flex flex-col overflow-y-auto">
        <!-- Header -->
        <div class="p-6 border-b border-neutral-700">
          <h1 class="text-2xl font-bold text-white">
            <span *ngIf="!navigationService.isCuisine()">🛒 Caisse</span>
            <span *ngIf="navigationService.isCuisine()">👨‍🍳 Cuisine</span>
          </h1>
          <p class="text-xs text-neutral-400 mt-2">{{ getCurrentUserInfo() }}</p>
        </div>

        <!-- Menu Buttons -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
          <!-- Caissier Menu (ONLY for cashiers) -->
          <ng-container *ngIf="!navigationService.isCuisine()">
            <button (click)="navigate('/pos/order-entry')"
              [class.bg-primary]="isActive('/pos/order-entry')"
              [class.bg-neutral-700]="!isActive('/pos/order-entry')"
              class="w-full p-4 rounded-lg font-semibold transition-colors text-left flex items-center gap-3"
              [class.text-white]="isActive('/pos/order-entry')"
              [class.text-neutral-300]="!isActive('/pos/order-entry')">
              <span class="text-xl">📝</span>
              <span>Nouvelle Commande</span>
            </button>

            <button (click)="navigate('/pos/pending-orders')"
              [class.bg-primary]="isActive('/pos/pending-orders')"
              [class.bg-neutral-700]="!isActive('/pos/pending-orders')"
              class="w-full p-4 rounded-lg font-semibold transition-colors text-left flex items-center gap-3"
              [class.text-white]="isActive('/pos/pending-orders')"
              [class.text-neutral-300]="!isActive('/pos/pending-orders')">
              <span class="text-xl">⏳</span>
              <span>En Attente</span>
              <span class="ml-auto text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">0</span>
            </button>

            <button (click)="navigate('/pos/my-orders')"
              [class.bg-primary]="isActive('/pos/my-orders')"
              [class.bg-neutral-700]="!isActive('/pos/my-orders')"
              class="w-full p-4 rounded-lg font-semibold transition-colors text-left flex items-center gap-3"
              [class.text-white]="isActive('/pos/my-orders')"
              [class.text-neutral-300]="!isActive('/pos/my-orders')">
              <span class="text-xl">📋</span>
              <span>Mes Commandes</span>
            </button>

            <button (click)="navigate('/pos/checkout')"
              [class.bg-primary]="isActive('/pos/checkout')"
              [class.bg-neutral-700]="!isActive('/pos/checkout')"
              class="w-full p-4 rounded-lg font-semibold transition-colors text-left flex items-center gap-3"
              [class.text-white]="isActive('/pos/checkout')"
              [class.text-neutral-300]="!isActive('/pos/checkout')">
              <span class="text-xl">💳</span>
              <span>Encaissement</span>
            </button>
          </ng-container>

          <!-- Kitchen Menu (ONLY for kitchen staff) -->
          <ng-container *ngIf="navigationService.isCuisine()">
            <button (click)="navigate('/pos/kitchen')"
              [class.bg-primary]="isActive('/pos/kitchen')"
              [class.bg-neutral-700]="!isActive('/pos/kitchen')"
              class="w-full p-4 rounded-lg font-semibold transition-colors text-left flex items-center gap-3"
              [class.text-white]="isActive('/pos/kitchen')"
              [class.text-neutral-300]="!isActive('/pos/kitchen')">
              <span class="text-xl">👨‍🍳</span>
              <span>Cuisine Kanban</span>
            </button>

            <button (click)="navigate('/pos/kitchen/list')"
              [class.bg-primary]="isActive('/pos/kitchen/list')"
              [class.bg-neutral-700]="!isActive('/pos/kitchen/list')"
              class="w-full p-4 rounded-lg font-semibold transition-colors text-left flex items-center gap-3"
              [class.text-white]="isActive('/pos/kitchen/list')"
              [class.text-neutral-300]="!isActive('/pos/kitchen/list')">
              <span class="text-xl">📋</span>
              <span>Historique Cuisine</span>
            </button>
          </ng-container>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-neutral-700 space-y-2">
          <button 
            *ngIf="navigationService.isAdmin()"
            (click)="goToDashboard()" 
            class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm mb-2">
            📊 Dashboard
          </button>
          <button (click)="logout()" 
            class="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <!-- RIGHT: Main Content - FULL SIZE -->
      <div class="flex-1 overflow-hidden h-full">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class PosLayoutComponent implements OnInit {
  private router = inject(Router);
  navigationService = inject(NavigationService);

  currentRoute = signal('');

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.currentRoute.set(route);
  }

  isActive(route: string): boolean {
    return this.currentRoute().includes(route);
  }

  getCurrentUserInfo(): string {
    return `${this.navigationService.getCurrentUserName()} • ${this.navigationService.getCurrentUserRole()}`;
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
