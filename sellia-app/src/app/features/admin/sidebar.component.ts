import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AdminSidebarService } from './admin-sidebar.service';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed left-0 top-0 h-screen bg-dark border-r border-neutral-800 transition-all duration-300" [class.w-64]="!collapsed()" [class.w-20]="collapsed()">
      <!-- Logo Section -->
      <div class="flex items-center justify-between h-20 px-4 border-b border-neutral-800">
        <div *ngIf="!collapsed()" class="flex items-center space-x-2">
          <img src="/assets/logo.jpg" alt="Logo" class="w-8 h-8 rounded">
          <span class="text-white font-bold text-sm">Sellia</span>
        </div>
        <button (click)="toggleCollapse()" class="text-neutral-400 hover:text-primary transition-colors">
          <svg *ngIf="!collapsed()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <svg *ngIf="collapsed()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-2">
        <!-- Dashboard Link -->
        <a routerLink="/admin/dashboard" routerLinkActive="text-primary bg-primary/20" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all duration-200 font-semibold mb-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <span *ngIf="!collapsed()" class="text-sm font-medium truncate">🏠 Accueil</span>
        </a>

        <!-- Divider -->
        <div class="border-t border-neutral-700 my-3"></div>

        <div *ngFor="let item of menuItems" class="group">
          <!-- Menu Item with potential children -->
          <div *ngIf="item.children && item.children.length > 0">
            <button (click)="toggleMenu(item)" class="w-full flex items-center justify-between px-4 py-2 text-neutral-400 hover:text-primary hover:bg-neutral-800/50 rounded transition-all duration-200 group-hover:text-primary">
              <div class="flex items-center space-x-3 min-w-0">
                <svg class="w-5 h-5 flex-shrink-0" [innerHTML]="getSafeIcon(item.icon)" fill="currentColor"></svg>
                <span *ngIf="!collapsed()" class="text-sm font-medium truncate">{{ item.label }}</span>
              </div>
              <svg *ngIf="!collapsed()" class="w-4 h-4 flex-shrink-0 transition-transform" [class.rotate-90]="item.expanded" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <!-- Submenu -->
            <div *ngIf="item.expanded && !collapsed()" class="ml-3 mt-1 space-y-1 pl-3 border-l border-neutral-700">
              <a *ngFor="let child of item.children" [routerLink]="child.route" routerLinkActive="text-primary bg-neutral-800/50" class="block px-3 py-2 text-sm text-neutral-400 hover:text-primary hover:bg-neutral-800/30 rounded transition-colors">
                {{ child.label }}
              </a>
            </div>
          </div>

          <!-- Simple Menu Item -->
          <a *ngIf="!item.children || item.children.length === 0" [routerLink]="item.route" routerLinkActive="text-primary bg-neutral-800/50" class="flex items-center space-x-3 px-4 py-2 text-neutral-400 hover:text-primary hover:bg-neutral-800/50 rounded transition-all duration-200">
            <svg class="w-5 h-5 flex-shrink-0" [innerHTML]="getSafeIcon(item.icon)" fill="currentColor"></svg>
            <span *ngIf="!collapsed()" class="text-sm font-medium truncate">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <!-- User Section (Bottom) -->
      <div class="border-t border-neutral-800 p-4">
        <button class="w-full flex items-center space-x-3 px-4 py-2 text-neutral-400 hover:text-primary hover:bg-neutral-800/50 rounded transition-all duration-200">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          <span *ngIf="!collapsed()" class="text-sm font-medium truncate">Profil</span>
        </button>
      </div>
    </aside>
  `,
  styles: []
})
export class SidebarComponent {
  private sidebarService = inject(AdminSidebarService);
  collapsed = this.sidebarService.collapsed;
  private sanitizer = inject(DomSanitizer);

  getSafeIcon(icon: string | undefined): SafeHtml {
    return icon ? this.sanitizer.bypassSecurityTrustHtml(icon) : this.sanitizer.bypassSecurityTrustHtml('');
  }

  menuItems: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      icon: this.getIcon('dashboard'),
      route: '/dashboard',
      expanded: false
    },
    {
      label: 'Caisse',
      icon: this.getIcon('cashier'),
      children: [
        { label: 'Nouvelle Commande', route: '/pos/order-entry' },
        { label: 'Mes Commandes', route: '/pos/my-orders' },
        { label: 'Encaissement', route: '/pos/checkout' }
      ],
      expanded: false
    },
    {
      label: 'Cuisine',
      icon: this.getIcon('kitchen'),
      children: [
        { label: 'Commandes', route: '/pos/kitchen' },
        { label: 'En Attente', route: '/pos/pending-orders' }
      ],
      expanded: false
    },
    {
      label: 'Produits',
      icon: this.getIcon('products'),
      children: [
        { label: 'Catalogue', route: '/admin/products' },
        { label: 'Catégories', route: '/admin/products' }
      ],
      expanded: false
    },
    {
      label: 'Inventaire',
      icon: this.getIcon('inventory'),
      route: '/admin/inventory',
      expanded: false
    },
    {
      label: 'Utilisateurs',
      icon: this.getIcon('users'),
      route: '/admin/users',
      expanded: false
    },
    {
      label: 'Tables & QR',
      icon: this.getIcon('tables'),
      route: '/admin/tables',
      expanded: false
    },
    {
      label: 'Rapports',
      icon: this.getIcon('reports'),
      children: [
        { label: 'Ventes', route: '/admin/reports/sales' },
        { label: 'Produits', route: '/admin/reports/products' },
        { label: 'Personnel', route: '/admin/reports/staff' }
      ],
      expanded: false
    },
    {
      label: 'Paramètres',
      icon: this.getIcon('settings'),
      route: '/admin/settings',
      expanded: false
    }
  ];

  toggleCollapse(): void {
    this.sidebarService.toggleCollapsed();
  }

  toggleMenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  private getIcon(name: string): string {
    const icons: { [key: string]: string } = {
      dashboard: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>',
      cashier: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
      kitchen: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.96-3.83-1.3 1.6 4.25 5.5 4.08-5.27z"/>',
      products: '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l0.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-0.9-2-2-2z"/>',
      inventory: '<path d="M9 5c-1.1 0-2 .9-2 2h2V5zm0 4H7v2h2V9zm0 4H7v2h2v-2zm4-8c-1.1 0-2 .9-2 2h2V5zm0 4h-2v2h2V9zm0 4h-2v2h2v-2zm4-8c-1.1 0-2 .9-2 2h2V5zm0 4h-2v2h2V9zm0 4h-2v2h2v-2zM5 1h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2z"/>',
      users: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
      tables: '<path d="M7 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm13 1h-6v-1c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1H1v2h2.2c.1.23.31.43.6.57.29.14.62.23.97.23s.68-.09.97-.23c.29-.14.5-.34.6-.57H19v-2zm-1 4H4c-1.1 0-2 .9-2 2v6h2v-4h12v4h2v-6c0-1.1-.9-2-2-2z"/>',
      reports: '<path d="M9 17H7v5h2V17zm4-7H11v12h2V10zm4-3h-2v15h2V7zM4.5 17h-2v5h2v-5zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 15H4V6h16v13z"/>',
      settings: '<path d="M19.14,12.94c0.04,-0.3 0.06,-0.61 0.06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c0.18,-0.14 0.23,-0.41 0.12,-0.64l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,0.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,0.17 -0.47,0.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,0.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58C4.84,11.36 4.8,11.69 4.8,12s0.02,0.64 0.07,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.64l1.92,3.32c0.12,0.22 0.37,0.29 0.59,0.22l2.39,-0.96c0.5,0.38 1.03,0.7 1.62,0.94l0.36,2.54c0.05,0.24 0.24,0.41 0.48,0.41h3.84c0.24,0 0.44,-0.17 0.47,-0.41l0.36,-2.54c0.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,0.96c0.22,0.08 0.47,0 0.59,-0.22l1.92,-3.32c0.12,-0.22 0.07,-0.5 -0.12,-0.64L19.14,12.94zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6S13.98,15.6 12,15.6z"/>'
    };
    return icons[name] || '';
  }
}
