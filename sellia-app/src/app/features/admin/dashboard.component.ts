import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- KPIs Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-neutral-400 text-sm font-medium">Chiffre d'affaires</p>
          <p class="text-3xl font-bold text-primary mt-2">$0</p>
          <p class="text-xs text-neutral-500 mt-2">Aujourd'hui</p>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-neutral-400 text-sm font-medium">Commandes</p>
          <p class="text-3xl font-bold text-primary mt-2">0</p>
          <p class="text-xs text-neutral-500 mt-2">Aujourd'hui</p>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-neutral-400 text-sm font-medium">Stock Faible</p>
          <p class="text-3xl font-bold text-red-500 mt-2">0</p>
          <p class="text-xs text-neutral-500 mt-2">Alertes</p>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-neutral-400 text-sm font-medium">Utilisateurs Actifs</p>
          <p class="text-3xl font-bold text-green-600 mt-2">0</p>
          <p class="text-xs text-neutral-500 mt-2">En ligne</p>
        </div>
      </div>

      <!-- Modules Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Module Card Template -->
        <div *ngFor="let module of modules" class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-white">{{ module.title }}</h3>
              <p class="text-sm text-neutral-400 mt-1">{{ module.description }}</p>
            </div>
            <div class="text-3xl">{{ module.icon }}</div>
          </div>
          <a *ngIf="module.route" [routerLink]="module.route" class="inline-block text-sm text-primary hover:text-primary-dark font-medium transition-colors">
            → {{ module.buttonText }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  modules = [
    {
      title: 'Commandes en Temps Réel',
      description: 'Suivi de toutes les commandes actives',
      icon: '📋',
      color: '#3B82F6',
      route: '/admin/active-orders',
      buttonText: 'Voir les commandes'
    },
    {
      title: 'Sessions Actives',
      description: 'Caissiers en ligne et leur activité',
      icon: '👥',
      color: '#10B981',
      route: '/admin/active-sessions',
      buttonText: 'Voir les sessions'
    },
    {
      title: 'Menus & Articles',
      description: 'Gérer vos menus et articles',
      icon: '🍽️',
      color: '#F59E0B',
      route: '/admin/menus',
      buttonText: 'Gérer les menus'
    },
    {
      title: 'Inventaire',
      description: 'Gestion du stock et alertes',
      icon: '📊',
      color: '#EAB308',
      route: '/admin/inventory',
      buttonText: 'Voir l\'inventaire'
    },
    {
      title: 'Produits',
      description: 'Catalogue articles',
      icon: '📦',
      color: '#10B981',
      route: '/admin/products',
      buttonText: 'Gérer les produits'
    },
    {
      title: 'Utilisateurs',
      description: 'Créer et gérer les comptes',
      icon: '👤',
      color: '#A855F7',
      route: '/admin/users',
      buttonText: 'Gérer l\'équipe'
    },
    {
      title: 'Gestion Caisses',
      description: 'Créer et gérer les caisses',
      icon: '💳',
      color: '#8B5CF6',
      route: '/admin/cashiers',
      buttonText: 'Gérer les caisses'
    },
    {
      title: 'Session Globale',
      description: 'Ouverture/fermeture journalière',
      icon: '🔐',
      color: '#DC2626',
      route: '/admin/global-session',
      buttonText: 'Gérer session'
    },
    {
      title: 'Rapports',
      description: 'Statistiques et analyses',
      icon: '📈',
      color: '#6366F1',
      route: '/admin/reports/sales',
      buttonText: 'Voir les rapports'
    },
    {
      title: 'QR Codes Tables',
      description: 'Génération et gestion des QR codes',
      icon: '📱',
      color: '#0891B2',
      route: '/admin/tables',
      buttonText: 'Gérer les tables'
    }
  ];
}
