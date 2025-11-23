import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
          <span *ngIf="collapsed()">&#9776;</span>
          <span *ngIf="!collapsed()">&#10005;</span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="p-3 space-y-1">
        <a routerLink="/auditor/dashboard"
           routerLinkActive="bg-primary text-white"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <span class="text-xl">&#128202;</span>
          <span *ngIf="!collapsed()">Dashboard</span>
        </a>

        <a routerLink="/auditor/audit-logs"
           routerLinkActive="bg-primary text-white"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <span class="text-xl">&#128466;</span>
          <span *ngIf="!collapsed()">Audit Logs</span>
        </a>

        <div class="pt-4 mt-4 border-t border-neutral-700">
          <span class="text-xs text-neutral-500 px-3 uppercase tracking-wider" *ngIf="!collapsed()">Monitoring</span>
        </div>

        <a href="http://localhost:3001" target="_blank"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <span class="text-xl">&#128200;</span>
          <span *ngIf="!collapsed()">Grafana</span>
        </a>

        <a href="http://localhost:9090" target="_blank"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
          <span class="text-xl">&#127760;</span>
          <span *ngIf="!collapsed()">Prometheus</span>
        </a>
      </nav>

      <!-- Logout -->
      <div class="absolute bottom-4 left-0 right-0 px-3">
        <button (click)="logout()"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors">
          <span class="text-xl">&#128682;</span>
          <span *ngIf="!collapsed()">Déconnexion</span>
        </button>
      </div>
    </aside>
  `
})
export class AuditorSidebarComponent {
  private authService = inject(AuthService);
  collapsed = signal(false);

  toggleCollapse(): void {
    this.collapsed.set(!this.collapsed());
  }

  logout(): void {
    this.authService.logout();
  }
}
