import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantSettingsComponent } from './settings/restaurant/restaurant-settings.component';
import { PaymentSettingsComponent } from './settings/payment/payment-settings.component';
import { NotificationSettingsComponent } from './settings/notification/notification-settings.component';
import { SecuritySettingsComponent } from './settings/security/security-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, 
    RestaurantSettingsComponent,
    PaymentSettingsComponent,
    NotificationSettingsComponent,
    SecuritySettingsComponent
  ],
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
          <button (click)="showRestaurant.set(true)" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">💳 Paiement</h3>
          <p class="text-neutral-400">Configuration des modes de paiement</p>
          <button (click)="showPayment.set(true)" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">🔔 Notifications</h3>
          <p class="text-neutral-400">Paramètres des notifications et alertes</p>
          <button (click)="showNotification.set(true)" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-lg font-bold text-white mb-4">🔐 Sécurité</h3>
          <p class="text-neutral-400">Paramètres de sécurité et authentification</p>
          <button (click)="showSecurity.set(true)" class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            Configurer
          </button>
        </div>
      </div>

      <!-- Modals -->
      <app-restaurant-settings *ngIf="showRestaurant()" [closeSignal]="showRestaurant"></app-restaurant-settings>
      <app-payment-settings *ngIf="showPayment()" [closeSignal]="showPayment"></app-payment-settings>
      <app-notification-settings *ngIf="showNotification()" [closeSignal]="showNotification"></app-notification-settings>
      <app-security-settings *ngIf="showSecurity()" [closeSignal]="showSecurity"></app-security-settings>
    </div>
  `
})
export class SettingsComponent {
  showRestaurant = signal(false);
  showPayment = signal(false);
  showNotification = signal(false);
  showSecurity = signal(false);
}
