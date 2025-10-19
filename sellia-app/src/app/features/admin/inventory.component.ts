import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">📊 Inventaire</h1>
        <p class="text-neutral-400">Gestion du stock et des mouvements d'inventaire</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">📦 Stock</h3>
          <p class="text-neutral-400">Voir et gérer le stock des produits</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Accéder
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">⚠️ Alertes</h3>
          <p class="text-neutral-400">Stock faible et alertes d'inventaire</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Voir Alertes
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">📝 Mouvements</h3>
          <p class="text-neutral-400">Historique des mouvements de stock</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Voir Mouvements
          </button>
        </div>
      </div>
    </div>
  `
})
export class InventoryComponent {}
