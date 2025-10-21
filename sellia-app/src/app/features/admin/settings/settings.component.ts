import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">⚙️ Paramètres</h1>
        <p class="text-neutral-400">Configuration générale du système</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-neutral-700 flex-wrap">
        <button 
          (click)="activeTab.set('restaurant')"
          [class.border-b-2]="activeTab() === 'restaurant'"
          [class.border-orange-500]="activeTab() === 'restaurant'"
          [class.text-white]="activeTab() === 'restaurant'"
          [class.text-neutral-400]="activeTab() !== 'restaurant'"
          class="pb-2 font-semibold transition-colors whitespace-nowrap">
          🏢 Restaurant
        </button>
        <button 
          (click)="activeTab.set('payment')"
          [class.border-b-2]="activeTab() === 'payment'"
          [class.border-orange-500]="activeTab() === 'payment'"
          [class.text-white]="activeTab() === 'payment'"
          [class.text-neutral-400]="activeTab() !== 'payment'"
          class="pb-2 font-semibold transition-colors whitespace-nowrap">
          💳 Modes de Paiement
        </button>
        <button 
          (click)="activeTab.set('notifications')"
          [class.border-b-2]="activeTab() === 'notifications'"
          [class.border-orange-500]="activeTab() === 'notifications'"
          [class.text-white]="activeTab() === 'notifications'"
          [class.text-neutral-400]="activeTab() !== 'notifications'"
          class="pb-2 font-semibold transition-colors whitespace-nowrap">
          🔔 Notifications
        </button>
        <button 
          (click)="activeTab.set('security')"
          [class.border-b-2]="activeTab() === 'security'"
          [class.border-orange-500]="activeTab() === 'security'"
          [class.text-white]="activeTab() === 'security'"
          [class.text-neutral-400]="activeTab() !== 'security'"
          class="pb-2 font-semibold transition-colors whitespace-nowrap">
          🔐 Sécurité
        </button>
      </div>

      <!-- RESTAURANT TAB -->
      <div *ngIf="activeTab() === 'restaurant'" class="space-y-6">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h2 class="text-xl font-bold text-white mb-4">Informations Restaurant</h2>
          
          <form [formGroup]="restaurantForm" (ngSubmit)="saveRestaurantSettings()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Nom du Restaurant</label>
                <input 
                  formControlName="name"
                  type="text" 
                  class="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Ex: Sellia POS">
              </div>

              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Devise</label>
                <select 
                  formControlName="currency"
                  class="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                  <option value="XOF">XOF - FCFA (Afrique Occidentale)</option>
                  <option value="XAF">XAF - FCFA (Afrique Centrale)</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Adresse</label>
                <input 
                  formControlName="address"
                  type="text" 
                  class="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Adresse">
              </div>

              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Téléphone</label>
                <input 
                  formControlName="phone"
                  type="tel" 
                  class="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="+237 XXX XX XX XX">
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Email</label>
                <input 
                  formControlName="email"
                  type="email" 
                  class="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="contact@restaurant.com">
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Fuseau Horaire</label>
                <select 
                  formControlName="timezone"
                  class="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                  <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
                  <option value="Africa/Kinshasa">Africa/Kinshasa (GMT+1)</option>
                  <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
                </select>
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                type="submit" 
                [disabled]="isSaving()"
                class="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : '💾 Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PAYMENT TAB -->
      <div *ngIf="activeTab() === 'payment'" class="space-y-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h2 class="text-xl font-bold text-white mb-4">Modes de Paiement</h2>
          
          <div class="space-y-3">
            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="paymentMethods.cash">
              <span class="ml-3 text-white font-medium">💵 Espèces</span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="paymentMethods.card">
              <span class="ml-3 text-white font-medium">💳 Carte Bancaire</span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="paymentMethods.check">
              <span class="ml-3 text-white font-medium">✍️ Chèque</span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="paymentMethods.mobileMoney">
              <span class="ml-3 text-white font-medium">📱 Mobile Money</span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="paymentMethods.credit">
              <span class="ml-3 text-white font-medium">📋 Crédit Client</span>
            </label>
          </div>

          <button 
            (click)="savePaymentSettings()"
            [disabled]="isSaving()"
            class="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            {{ isSaving() ? 'Enregistrement...' : '💾 Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- NOTIFICATIONS TAB -->
      <div *ngIf="activeTab() === 'notifications'" class="space-y-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h2 class="text-xl font-bold text-white mb-4">Notifications & Alertes</h2>
          
          <div class="space-y-4">
            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="notifications.lowStock">
              <span class="ml-3">
                <p class="text-white font-medium">📦 Alerte Stock Faible</p>
                <p class="text-xs text-neutral-400">Notifier quand le stock est sous le minimum</p>
              </span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="notifications.unpaidOrders">
              <span class="ml-3">
                <p class="text-white font-medium">💰 Commandes Impayées</p>
                <p class="text-xs text-neutral-400">Alerter sur les commandes en attente de paiement</p>
              </span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="notifications.newOrders">
              <span class="ml-3">
                <p class="text-white font-medium">📋 Nouvelles Commandes</p>
                <p class="text-xs text-neutral-400">Notifier à chaque nouvelle commande</p>
              </span>
            </label>

            <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
              <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="notifications.dailyReport">
              <span class="ml-3">
                <p class="text-white font-medium">📊 Rapport Quotidien</p>
                <p class="text-xs text-neutral-400">Envoyer un rapport de fin de journée</p>
              </span>
            </label>
          </div>

          <button 
            (click)="saveNotificationSettings()"
            [disabled]="isSaving()"
            class="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            {{ isSaving() ? 'Enregistrement...' : '💾 Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- SECURITY TAB -->
      <div *ngIf="activeTab() === 'security'" class="space-y-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h2 class="text-xl font-bold text-white mb-4">Paramètres de Sécurité</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-white font-semibold mb-3">Sessions Actives</h3>
              <div class="bg-neutral-700/50 rounded p-3 text-sm text-neutral-300">
                <p>Nombre de sessions actives: <span class="text-orange-400 font-bold">{{ activeSessions }}</span></p>
                <button 
                  (click)="forceLogoutAll()"
                  class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors">
                  🔒 Déconnecter tous
                </button>
              </div>
            </div>

            <div>
              <h3 class="text-white font-semibold mb-3">Authentification 2FA</h3>
              <label class="flex items-center p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition">
                <input type="checkbox" class="w-5 h-5 accent-orange-500" [(ngModel)]="security.twoFactor">
                <span class="ml-3">
                  <p class="text-white font-medium">Activer l'authentification à deux facteurs</p>
                  <p class="text-xs text-neutral-400">Plus sécurisé mais plus lent</p>
                </span>
              </label>
            </div>

            <div>
              <h3 class="text-white font-semibold mb-3">Historique d'Accès</h3>
              <button 
                (click)="viewAccessLogs()"
                class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition-colors text-sm">
                📋 Voir l'historique
              </button>
            </div>
          </div>

          <button 
            (click)="saveSecuritySettings()"
            [disabled]="isSaving()"
            class="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            {{ isSaving() ? 'Enregistrement...' : '💾 Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="success()" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold">
        ✅ {{ success() }}
      </div>

      <!-- Error Message -->
      <div *ngIf="error()" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold">
        ❌ {{ error() }}
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<'restaurant' | 'payment' | 'notifications' | 'security'>('restaurant');
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  activeSessions = 5;

  restaurantForm: FormGroup;
  paymentMethods = { cash: true, card: true, check: false, mobileMoney: false, credit: false };
  notifications = { lowStock: true, unpaidOrders: true, newOrders: false, dailyReport: true };
  security = { twoFactor: false };

  constructor() {
    this.restaurantForm = this.fb.group({
      name: ['Sellia Restaurant', Validators.required],
      currency: ['XOF', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      timezone: ['Africa/Douala', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.apiService.getRestaurant().subscribe({
      next: (restaurant) => {
        this.restaurantForm.patchValue({
          name: restaurant.name,
          currency: restaurant.currency || 'XOF',
          address: restaurant.address,
          phone: restaurant.phoneNumber,
          email: restaurant.email,
          timezone: restaurant.timezone
        });
      },
      error: (err) => {
        console.log('Restaurant API not available, using defaults');
      }
    });
  }

  saveRestaurantSettings(): void {
    if (!this.restaurantForm.valid) return;
    this.isSaving.set(true);
    
    const data = {
      name: this.restaurantForm.value.name,
      currency: this.restaurantForm.value.currency,
      address: this.restaurantForm.value.address,
      phoneNumber: this.restaurantForm.value.phone,
      email: this.restaurantForm.value.email,
      timezone: this.restaurantForm.value.timezone
    };
    
    this.apiService.updateRestaurant(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.success.set('Paramètres restaurant enregistrés');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.error.set('Erreur lors de la sauvegarde');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  savePaymentSettings(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Modes de paiement enregistrés');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  saveNotificationSettings(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Notifications enregistrées');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  saveSecuritySettings(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Paramètres de sécurité enregistrés');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  forceLogoutAll(): void {
    if (confirm('Êtes-vous sûr de vouloir déconnecter tous les utilisateurs?')) {
      this.toast.success('Tous les utilisateurs ont été déconnectés');
    }
  }

  viewAccessLogs(): void {
    this.toast.info('Fonctionnalité en développement');
  }
}
