import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">📊 Gestion d'Inventaire</h1>
          <p class="text-neutral-400">Gestion du stock et des mouvements d'inventaire</p>
        </div>
        <button (click)="refreshInventory()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-neutral-700">
        <button 
          (click)="activeTab.set('stock')"
          [class.border-b-2]="activeTab() === 'stock'"
          [class.border-orange-500]="activeTab() === 'stock'"
          [class.text-white]="activeTab() === 'stock'"
          [class.text-neutral-400]="activeTab() !== 'stock'"
          class="pb-2 font-semibold transition-colors">
          📦 Stock Actuel
        </button>
        <button 
          (click)="activeTab.set('alerts')"
          [class.border-b-2]="activeTab() === 'alerts'"
          [class.border-orange-500]="activeTab() === 'alerts'"
          [class.text-white]="activeTab() === 'alerts'"
          [class.text-neutral-400]="activeTab() !== 'alerts'"
          class="pb-2 font-semibold transition-colors">
          ⚠️ Alertes ({{ lowStocks().length }})
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Produits en stock</p>
              <p class="text-3xl font-bold text-blue-500">{{ stocks().length }}</p>
            </div>
            <div class="text-4xl opacity-30">📦</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Stock faible</p>
              <p class="text-3xl font-bold text-orange-500">{{ lowStocks().length }}</p>
            </div>
            <div class="text-4xl opacity-30">⚠️</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Total mouvements</p>
              <p class="text-3xl font-bold text-green-500">{{ 0 }}</p>
            </div>
            <div class="text-4xl opacity-30">📈</div>
          </div>
        </div>
      </div>

      <!-- Stock Tab -->
      <div *ngIf="activeTab() === 'stock'" class="space-y-4">
        <div class="flex gap-2 mb-4">
          <input 
            [(ngModel)]="searchText"
            type="text" 
            placeholder="Rechercher un produit..."
            class="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
        </div>

        <div *ngIf="isLoading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>

        <div *ngIf="!isLoading() && filteredStocks().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-neutral-700 border-b border-neutral-600">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-white">Produit</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-white">Stock Actuel</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-white">Stock Min</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-white">Stock Max</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-white">Statut</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let stock of filteredStocks()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-white font-semibold">{{ stock.productName }}</div>
                  <div class="text-xs text-neutral-400">{{ stock.productCategory }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-white font-semibold text-lg">{{ stock.quantity }}</span>
                  <span class="text-xs text-neutral-400 ml-1">{{ stock.unit }}</span>
                </td>
                <td class="px-6 py-4 text-neutral-300">{{ stock.minimumStock }}</td>
                <td class="px-6 py-4 text-neutral-300">{{ stock.maximumStock }}</td>
                <td class="px-6 py-4">
                  <span [class]="getStockStatusClass(stock)" class="px-2 py-1 rounded text-xs font-semibold">
                    {{ getStockStatus(stock) }}
                  </span>
                </td>
                <td class="px-6 py-4 space-x-2 flex">
                  <button (click)="openAdjustModal(stock)" class="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    ⚖️ Ajuster
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!isLoading() && filteredStocks().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
          <p class="text-neutral-400">Aucun produit trouvé</p>
        </div>
      </div>

      <!-- Alerts Tab -->
      <div *ngIf="activeTab() === 'alerts'" class="space-y-4">
        <div *ngIf="isLoading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>

        <div *ngIf="!isLoading() && lowStocks().length > 0" class="space-y-4">
          <div *ngFor="let stock of lowStocks()" class="bg-red-900/20 border border-red-600 rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-white font-bold">{{ stock.productName }}</h3>
              <span class="bg-red-900/40 text-red-300 px-2 py-1 rounded text-xs font-semibold">ALERTE</span>
            </div>
            <div class="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p class="text-xs text-neutral-400">Stock Actuel</p>
                <p class="text-lg font-bold text-red-400">{{ stock.quantity }} {{ stock.unit }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-400">Stock Min</p>
                <p class="text-lg font-bold text-orange-400">{{ stock.minimumStock }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-400">À Commander</p>
                <p class="text-lg font-bold text-yellow-400">{{ stock.minimumStock - stock.quantity }}</p>
              </div>
            </div>
            <button (click)="openAdjustModal(stock)" class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors text-sm">
              ⚖️ Ajuster Stock
            </button>
          </div>
        </div>

        <div *ngIf="!isLoading() && lowStocks().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
          <p class="text-neutral-400 text-lg">✅ Aucune alerte</p>
          <p class="text-neutral-500 text-sm mt-2">Tous les stocks sont au-dessus du minimum</p>
        </div>
      </div>

      <!-- Adjust Modal -->
      <div *ngIf="showAdjustModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 max-w-md w-full border border-neutral-700">
          <h2 class="text-2xl font-bold text-white mb-4">Ajuster Stock</h2>
          
          <div class="bg-neutral-700 rounded p-4 mb-4">
            <p class="text-sm text-neutral-400">Produit</p>
            <p class="text-lg font-bold text-white">{{ editingStock?.productName }}</p>
            <p class="text-sm text-neutral-400 mt-2">Stock Actuel: <span class="text-white font-bold">{{ editingStock?.quantity }}</span></p>
          </div>

          <form [formGroup]="adjustForm" (ngSubmit)="saveAdjustment()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Type d'ajustement</label>
              <select formControlName="adjustmentType" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
                <option value="ADD">➕ Ajouter</option>
                <option value="REMOVE">➖ Retirer</option>
                <option value="SET">🎯 Définir</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Quantité</label>
              <input 
                formControlName="quantity" 
                type="number" 
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white"
                placeholder="0">
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Raison</label>
              <select formControlName="reason" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
                <option value="">-- Sélectionner --</option>
                <option value="RECEPTION">Réception de marchandise</option>
                <option value="VENTE">Vente</option>
                <option value="CASSE">Produit cassé</option>
                <option value="INVENTAIRE">Comptage d'inventaire</option>
                <option value="RETOUR">Retour</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="closeAdjustModal()" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button type="submit" [disabled]="!adjustForm.valid || isSaving()" class="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Ajustement...' : 'Confirmer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Error Toast -->
      <div *ngIf="error()" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg">
        {{ error() }}
      </div>
    </div>
  `,
  styles: []
})
export class InventoryComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  stocks = signal<any[]>([]);
  lowStocks = signal<any[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'stock' | 'alerts'>('stock');
  searchText = '';

  showAdjustModal = false;
  editingStock: any = null;
  adjustForm: FormGroup;

  constructor() {
    this.adjustForm = this.fb.group({
      adjustmentType: ['ADD', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.isLoading.set(true);
    
    this.apiService.getStocks().subscribe({
      next: (data) => {
        this.stocks.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement du stock');
        this.isLoading.set(false);
      }
    });

    this.apiService.getLowStocks().subscribe({
      next: (data) => {
        this.lowStocks.set(data);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des alertes');
      }
    });
  }

  filteredStocks(): any[] {
    return this.stocks().filter(s => 
      s.productName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getStockStatus(stock: any): string {
    if (stock.quantity <= stock.minimumStock) return 'CRITIQUE';
    if (stock.quantity <= stock.minimumStock * 1.5) return 'FAIBLE';
    if (stock.quantity >= stock.maximumStock) return 'MAX';
    return 'BON';
  }

  getStockStatusClass(stock: any): string {
    const status = this.getStockStatus(stock);
    const classes: { [key: string]: string } = {
      'CRITIQUE': 'bg-red-900/30 text-red-300',
      'FAIBLE': 'bg-orange-900/30 text-orange-300',
      'MAX': 'bg-blue-900/30 text-blue-300',
      'BON': 'bg-green-900/30 text-green-300'
    };
    return classes[status] || 'bg-gray-900/30 text-gray-300';
  }

  openAdjustModal(stock: any): void {
    this.editingStock = stock;
    this.adjustForm.reset({ adjustmentType: 'ADD', quantity: 0, reason: '' });
    this.showAdjustModal = true;
  }

  closeAdjustModal(): void {
    this.showAdjustModal = false;
  }

  saveAdjustment(): void {
    if (!this.adjustForm.valid || !this.editingStock) return;

    this.isSaving.set(true);
    const { adjustmentType, quantity, reason } = this.adjustForm.value;

    let quantityChange = quantity;
    if (adjustmentType === 'REMOVE') {
      quantityChange = -quantity;
    } else if (adjustmentType === 'SET') {
      quantityChange = quantity - this.editingStock.quantity;
    }

    this.apiService.adjustStock(this.editingStock.publicId, quantityChange, reason).subscribe({
      next: () => {
        this.toast.success('Stock ajusté');
        this.closeAdjustModal();
        this.loadInventory();
        this.isSaving.set(false);
      },
      error: () => {
        this.error.set('Erreur lors de l\'ajustement');
        this.isSaving.set(false);
      }
    });
  }

  refreshInventory(): void {
    this.loadInventory();
    this.toast.success('Inventaire rafraîchi');
  }
}
