import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">⚙️ Paramètres</h1>
        <p class="text-neutral-400">Configuration générale du système</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">🏢 Restaurant</h3>
          <p class="text-neutral-400">Informations de base du restaurant</p>
          <button (click)="openRestaurantSettings()" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">💳 Paiement</h3>
          <p class="text-neutral-400">Configuration des modes de paiement</p>
          <button (click)="openPaymentSettings()" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">🔔 Notifications</h3>
          <p class="text-neutral-400">Paramètres des notifications et alertes</p>
          <button (click)="openNotificationSettings()" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">🔐 Sécurité</h3>
          <p class="text-neutral-400">Paramètres de sécurité et authentification</p>
          <button (click)="openSecuritySettings()" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private toast = inject(ToastService);

  openRestaurantSettings(): void {
    this.toast.info('🏢 Configuration Restaurant - À venir');
  }

  openPaymentSettings(): void {
    this.toast.info('💳 Configuration Paiement - À venir');
  }

  openNotificationSettings(): void {
    this.toast.info('🔔 Configuration Notifications - À venir');
  }

  openSecuritySettings(): void {
    this.toast.info('🔐 Configuration Sécurité - À venir');
  }
}
