import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WritableSignal } from '@angular/core';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
      <div class="bg-neutral-800 rounded-lg max-w-2xl w-full flex flex-col border border-neutral-700" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-neutral-700">
          <h2 class="text-2xl font-bold text-white">💳 Modes de Paiement</h2>
          <p class="text-neutral-400 text-sm mt-1">Configurez les modes de paiement acceptés</p>
        </div>
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 bg-neutral-700 rounded">
            <input [(ngModel)]="paymentMethods.cash" type="checkbox" class="w-4 h-4">
            <label class="text-white font-semibold">Espèces</label>
          </div>

          <div class="flex items-center gap-3 p-3 bg-neutral-700 rounded">
            <input [(ngModel)]="paymentMethods.card" type="checkbox" class="w-4 h-4">
            <label class="text-white font-semibold">Carte Bancaire</label>
          </div>

          <div class="flex items-center gap-3 p-3 bg-neutral-700 rounded">
            <input [(ngModel)]="paymentMethods.check" type="checkbox" class="w-4 h-4">
            <label class="text-white font-semibold">Chèque</label>
          </div>

          <div class="flex items-center gap-3 p-3 bg-neutral-700 rounded">
            <input [(ngModel)]="paymentMethods.mobileMoney" type="checkbox" class="w-4 h-4">
            <label class="text-white font-semibold">Mobile Money</label>
          </div>

          <div class="flex items-center gap-3 p-3 bg-neutral-700 rounded">
            <input [(ngModel)]="paymentMethods.credit" type="checkbox" class="w-4 h-4">
            <label class="text-white font-semibold">Crédit Client</label>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-neutral-700 flex gap-2 justify-end">
          <button (click)="closeModal()" class="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition-colors">
            ✕ Fermer
          </button>
          <button (click)="save()" class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            ✅ Enregistrer
          </button>
        </div>
      </div>
    </div>
  `
})
export class PaymentSettingsComponent {
  closeSignal = input<WritableSignal<boolean>>();

  paymentMethods = {
    cash: true,
    card: false,
    check: false,
    mobileMoney: false,
    credit: false
  };

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  save(): void {
    console.log('Payment methods saved:', this.paymentMethods);
    this.closeModal();
  }
}
