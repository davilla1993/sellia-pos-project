import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auditor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed left-0 top-0 h-screen bg-neutral-800 border-r border-neutral-700 z-40 transition-all duration-300"
           [class.w-56]="!collapsed()"
           [class.w-20]="collapsed()">

      <!-- Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-neutral-700">
        <span class="font-bold text-primary text-lg" *ngIf="!collapsed()">Sellia Audit</span>
        <button (click)="toggleCollapse()"
                class="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
          <svg *ngIf="collapsed()" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
          <svg *ngIf="!collapsed()" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="p-3 space-y-1">
        <a routerLink="/auditor/dashboard"
           routerLinkActive="bg-primary text-white"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <span *ngIf="!collapsed()">Dashboard</span>
        </a>

        <a routerLink="/auditor/audit-logs"
           routerLinkActive="bg-primary text-white"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <span *ngIf="!collapsed()">Audit Logs</span>
        </a>

        <a routerLink="/auditor/application-logs"
           routerLinkActive="bg-primary text-white"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <span *ngIf="!collapsed()">Logs Application</span>
        </a>

        <a routerLink="/auditor/retention"
           routerLinkActive="bg-primary text-white"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z"/>
          </svg>
          <span *ngIf="!collapsed()">Rétention</span>
        </a>

      </nav>

      <!-- Logout -->
      <div class="absolute bottom-4 left-0 right-0 px-3">
        <button (click)="logout()"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <span *ngIf="!collapsed()">Déconnexion</span>
        </button>
      </div>
    </aside>
  `
})
export class AuditorSidebarComponent {
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  collapsed = signal(false);

  toggleCollapse(): void {
    this.collapsed.set(!this.collapsed());
  }

  logout(): void {
    this.authService.logout();
  }
}
