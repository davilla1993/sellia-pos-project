import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AdminSidebarService } from '@core/services/admin-sidebar.service';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  isSection?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
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
      route: '/admin/dashboard',
      expanded: false
    },

    // SECTION: SUIVI EN TEMPS RÉEL
    {
      label: '⚡ SUIVI EN TEMPS RÉEL',
      icon: '',
      route: '',
      expanded: false,
      isSection: true
    },
    {
      label: 'Sessions Actives',
      icon: this.getIcon('sessions'),
      route: '/admin/active-sessions',
      expanded: false
    },
    {
      label: 'Commandes Actives',
      icon: this.getIcon('orders'),
      route: '/admin/active-orders',
      expanded: false
    },

    // SECTION: GESTION OPÉRATIONNELLE
    {
      label: '🏪 GESTION OPÉRATIONNELLE',
      icon: '',
      route: '',
      expanded: false,
      isSection: true
    },
    {
      label: 'Caisse',
      icon: this.getIcon('cashier'),
      children: [
        { label: 'Nouvelle Commande', route: '/pos/order-entry' },
        { label: 'En Attente', route: '/pos/pending-orders' },
        { label: 'Mes Commandes', route: '/pos/my-orders' },
        { label: 'Encaissement', route: '/pos/checkout' }
      ],
      expanded: false
    },
    {
      label: 'Cuisine & Bar',
      icon: this.getIcon('kitchen'),
      children: [
        { label: 'Cuisine Kanban', route: '/pos/kitchen' },
        { label: 'Bar Kanban', route: '/pos/bar' }
      ],
      expanded: false
    },
    {
      label: 'Menus & Articles',
      icon: this.getIcon('menus'),
      route: '/admin/menus',
      expanded: false
    },
    {
      label: 'Inventaire',
      icon: this.getIcon('inventory'),
      route: '/admin/inventory',
      expanded: false
    },

    // SECTION: ADMINISTRATION
    {
      label: '⚙️ ADMINISTRATION',
      icon: '',
      route: '',
      expanded: false,
      isSection: true
    },
    {
      label: 'Utilisateurs',
      icon: this.getIcon('users'),
      route: '/admin/users',
      expanded: false
    },
    {
      label: 'Tables & QR Codes',
      icon: this.getIcon('tables'),
      route: '/admin/tables',
      expanded: false
    },
    {
      label: 'Produits',
      icon: this.getIcon('products'),
      children: [
        { label: 'Catalogue', route: '/admin/products/catalog' },
        { label: 'Catégories', route: '/admin/products/categories' }
      ],
      expanded: false
    },
    {
      label: 'Gestion Caisses',
      icon: this.getIcon('cashiers'),
      expanded: false,
      children: [
        {
          label: 'Liste des Caisses',
          route: '/admin/cashiers'
        },
        {
          label: 'Attribution aux Caissiers',
          route: '/admin/cashiers/assignment'
        }
      ]
    },
    {
      label: 'Session Globale',
      icon: this.getIcon('global'),
      route: '/admin/global-session',
      expanded: false
    },
    {
      label: 'Opérations de Caisse',
      icon: this.getIcon('cashoperations'),
      route: '/admin/cash-operations',
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
      cashiers: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
      kitchen: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.96-3.83-1.3 1.6 4.25 5.5 4.08-5.27z"/>',
      bar: '<path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z"/>',
      products: '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l0.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-0.9-2-2-2z"/>',
      menus: '<path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2z"/>',
      sessions: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
      orders: '<path d="M11 9h2V5h2V3h-2V1h-2v2h-2v2h2v4zm-4 9h14V5H7v13zm2-11h10v9H7v-9z"/>',
      analytics: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-3-5h2v5h-2zm-4-3h2v8h-2zm-4-2h2v10H8z"/>',
      alerts: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
      inventory: '<path d="M9 5c-1.1 0-2 .9-2 2h2V5zm0 4H7v2h2V9zm0 4H7v2h2v-2zm4-8c-1.1 0-2 .9-2 2h2V5zm0 4h-2v2h2V9zm0 4h-2v2h2v-2zm4-8c-1.1 0-2 .9-2 2h2V5zm0 4h-2v2h2V9zm0 4h-2v2h2v-2zM5 1h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2z"/>',
      users: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
      tables: '<path d="M7 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm13 1h-6v-1c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1H1v2h2.2c.1.23.31.43.6.57.29.14.62.23.97.23s.68-.09.97-.23c.29-.14.5-.34.6-.57H19v-2zm-1 4H4c-1.1 0-2 .9-2 2v6h2v-4h12v4h2v-6c0-1.1-.9-2-2-2z"/>',
      reports: '<path d="M9 17H7v5h2V17zm4-7H11v12h2V10zm4-3h-2v15h2V7zM4.5 17h-2v5h2v-5zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 15H4V6h16v13z"/>',
      global: '<path d="M11.99 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6.93 2c-.26-1.2-1.3-2.1-2.54-2.1-.29 0-.57.05-.82.12C14.96 3.94 13.5 2.86 11.99 2.86s-2.97 1.08-3.57 2.15c-.25-.07-.53-.12-.82-.12-1.23 0-2.28.9-2.54 2.1C3.97 7.11 3 8.85 3 10.77C3 15.57 6.96 19.5 11.77 19.5c4.81 0 8.77-3.93 8.77-8.73 0-1.92-.97-3.66-2.57-4.77z"/>',
      cashoperations: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>',
      settings: '<path d="M19.14,12.94c0.04,-0.3 0.06,-0.61 0.06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c0.18,-0.14 0.23,-0.41 0.12,-0.64l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,0.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,0.17 -0.47,0.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,0.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58C4.84,11.36 4.8,11.69 4.8,12s0.02,0.64 0.07,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.64l1.92,3.32c0.12,0.22 0.37,0.29 0.59,0.22l2.39,-0.96c0.5,0.38 1.03,0.7 1.62,0.94l0.36,2.54c0.05,0.24 0.24,0.41 0.48,0.41h3.84c0.24,0 0.44,-0.17 0.47,-0.41l0.36,-2.54c0.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,0.96c0.22,0.08 0.47,0 0.59,-0.22l1.92,-3.32c0.12,-0.22 0.07,-0.5 -0.12,-0.64L19.14,12.94zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6S13.98,15.6 12,15.6z"/>'
    };
    return icons[name] || '';
  }
}
