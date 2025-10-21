import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { WritableSignal } from '@angular/core';

@Component({
  selector: 'app-restaurant-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
      <div class="bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-neutral-700" (click)="$event.stopPropagation()">
        <h2 class="text-2xl font-bold text-white mb-4">🏢 Configuration Restaurant</h2>
        
        <div class="space-y-4 max-h-96 overflow-y-auto mb-4">
          <div>
            <label class="block text-sm font-semibold text-neutral-300 mb-2">Nom du Restaurant</label>
            <input [(ngModel)]="form.name" type="text" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
          </div>

          <div>
            <label class="block text-sm font-semibold text-neutral-300 mb-2">Description</label>
            <textarea [(ngModel)]="form.description" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500" rows="3"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Adresse</label>
              <input [(ngModel)]="form.address" type="text" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Téléphone</label>
              <input [(ngModel)]="form.phoneNumber" type="tel" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-neutral-300 mb-2">Email</label>
            <input [(ngModel)]="form.email" type="email" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Devise</label>
              <select [(ngModel)]="form.currency" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
                <option value="XAF">XAF - Franc CFA</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar US</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Fuseau Horaire</label>
              <select [(ngModel)]="form.timezone" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
                <option value="Africa/Douala">Douala (GMT+1)</option>
                <option value="Africa/Lagos">Lagos (GMT+1)</option>
                <option value="Africa/Kinshasa">Kinshasa (GMT+1)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-neutral-300 mb-2">Taux de Taxe (%)</label>
            <input [(ngModel)]="form.taxRate" type="number" min="0" max="100" step="0.1" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
          </div>

          <div>
            <label class="block text-sm font-semibold text-neutral-300 mb-2">Heures d'Ouverture</label>
            <input [(ngModel)]="form.openingHours" type="text" placeholder="Ex: Lun-Ven: 08h-22h, Sam-Dim: 10h-23h" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <button (click)="closeModal()" class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition-colors">
            Annuler
          </button>
          <button (click)="save()" [disabled]="isSaving()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            {{ isSaving() ? '⏳ Enregistrement...' : '✅ Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class RestaurantSettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  closeSignal = input<WritableSignal<boolean>>();
  isSaving = signal(false);
  
  form = {
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    currency: 'XAF',
    timezone: 'Africa/Douala',
    taxRate: 0,
    openingHours: ''
  };

  ngOnInit(): void {
    this.loadRestaurantData();
  }

  loadRestaurantData(): void {
    this.apiService.getRestaurant().subscribe({
      next: (data) => {
        this.form = { ...this.form, ...data };
      },
      error: (err) => {
        this.toast.error('Erreur lors du chargement des données');
        console.error(err);
      }
    });
  }

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.toast.warning('Le nom du restaurant est requis');
      return;
    }

    this.isSaving.set(true);
    this.apiService.updateRestaurant(this.form).subscribe({
      next: () => {
        this.toast.success('Configuration restaurant enregistrée');
        this.closeModal();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error('Erreur lors de la sauvegarde');
        console.error(err);
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }
}
