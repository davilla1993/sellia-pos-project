import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <div class="section-header mb-12">
        <div class="mb-4">
          <span class="inline-block px-3 py-1 bg-primary/10 text-primary text-xs uppercase font-bold rounded-full mb-3">Sellia POS</span>
        </div>
        <h1 class="section-title">Tableau de Bord Admin</h1>
        <p class="section-subtitle">Gestion centralisée du restaurant</p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="card hover:shadow-lg transition-shadow">
          <p class="text-neutral-600 text-sm">Chiffre d'affaires</p>
          <p class="text-3xl font-bold text-primary mt-2">$0</p>
          <p class="text-xs text-neutral-500 mt-2">Aujourd'hui</p>
        </div>

        <div class="card hover:shadow-lg transition-shadow">
          <p class="text-neutral-600 text-sm">Commandes</p>
          <p class="text-3xl font-bold text-primary mt-2">0</p>
          <p class="text-xs text-neutral-500 mt-2">Aujourd'hui</p>
        </div>

        <div class="card hover:shadow-lg transition-shadow">
          <p class="text-neutral-600 text-sm">Stock Faible</p>
          <p class="text-3xl font-bold text-red-500 mt-2">0</p>
          <p class="text-xs text-neutral-500 mt-2">Alertes</p>
        </div>

        <div class="card hover:shadow-lg transition-shadow">
          <p class="text-neutral-600 text-sm">Utilisateurs Actifs</p>
          <p class="text-3xl font-bold text-primary mt-2">0</p>
          <p class="text-xs text-neutral-500 mt-2">En ligne</p>
        </div>
      </div>

      <!-- Modules Principaux -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-dark mb-6">Modules de Gestion</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Carte Caisse -->
          <div class="card border-l-4 border-l-blue-500 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-dark">Caisse</h3>
                <p class="text-sm text-neutral-600 mt-1">Gestion des commandes et paiements</p>
              </div>
              <svg class="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="space-y-2">
              <button class="text-sm text-primary hover:text-primary-dark transition-colors">→ Accéder à la caisse</button>
            </div>
          </div>

          <!-- Carte Cuisine -->
          <div class="card border-l-4 border-l-orange-500 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-dark">Cuisine</h3>
                <p class="text-sm text-neutral-600 mt-1">Suivi des commandes en cuisine</p>
              </div>
              <svg class="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="space-y-2">
              <button class="text-sm text-primary hover:text-primary-dark transition-colors">→ Accéder à la cuisine</button>
            </div>
          </div>

          <!-- Carte Employés -->
          <div class="card border-l-4 border-l-purple-500 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-dark">Employés</h3>
                <p class="text-sm text-neutral-600 mt-1">Créer et gérer les comptes</p>
              </div>
              <svg class="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="space-y-2">
              <button class="text-sm text-primary hover:text-primary-dark transition-colors">→ Gérer les employés</button>
            </div>
          </div>

          <!-- Carte Produits -->
          <div class="card border-l-4 border-l-green-500 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-dark">Produits</h3>
                <p class="text-sm text-neutral-600 mt-1">Menus et catalogue articles</p>
              </div>
              <svg class="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="space-y-2">
              <button class="text-sm text-primary hover:text-primary-dark transition-colors">→ Gérer les produits</button>
            </div>
          </div>

          <!-- Carte Inventaire -->
          <div class="card border-l-4 border-l-yellow-500 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-dark">Inventaire</h3>
                <p class="text-sm text-neutral-600 mt-1">Gestion du stock et alertes</p>
              </div>
              <svg class="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="space-y-2">
              <button class="text-sm text-primary hover:text-primary-dark transition-colors">→ Voir l'inventaire</button>
            </div>
          </div>

          <!-- Carte Rapports -->
          <div class="card border-l-4 border-l-indigo-500 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-dark">Rapports</h3>
                <p class="text-sm text-neutral-600 mt-1">Statistiques et analyses</p>
              </div>
              <svg class="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="space-y-2">
              <button class="text-sm text-primary hover:text-primary-dark transition-colors">→ Voir les rapports</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Tables et QR Codes -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-4">Configuration</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button class="btn-secondary text-left">Gérer les tables</button>
          <button class="btn-secondary text-left">Générer les QR Codes</button>
          <button class="btn-secondary text-left">Paramètres du restaurant</button>
          <button class="btn-secondary text-left">Notifications</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {}
