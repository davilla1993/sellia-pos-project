import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
