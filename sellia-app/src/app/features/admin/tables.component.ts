import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">🪑 Tables & QR Codes</h1>
        <p class="text-neutral-400">Gestion des tables et générations de QR codes</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">🪑 Gestion des Tables</h3>
          <p class="text-neutral-400">Créer, éditer et gérer les tables du restaurant</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Gérer Tables
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">📱 Codes QR</h3>
          <p class="text-neutral-400">Générer et imprimer les QR codes pour les tables</p>
          <button class="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
            Générer QR Codes
          </button>
        </div>
      </div>
    </div>
  `
})
export class TablesComponent {}
