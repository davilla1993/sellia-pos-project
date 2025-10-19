import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">📈 Rapports</h1>
        <p class="text-neutral-400">Analyses et rapports d'activité</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">💰 Rapport Ventes</h3>
          <p class="text-neutral-400">Chiffre d'affaires et analyses de ventes</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Voir Rapport
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">📦 Rapport Produits</h3>
          <p class="text-neutral-400">Performance et popularité des produits</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Voir Rapport
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">👥 Rapport Équipe</h3>
          <p class="text-neutral-400">Performance et activité du personnel</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Voir Rapport
          </button>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {}
