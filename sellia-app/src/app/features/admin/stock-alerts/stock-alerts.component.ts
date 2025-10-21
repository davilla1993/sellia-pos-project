import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">📦 Alertes Stock</h1>
          <p class="text-neutral-400">Gestion des seuils et alertes de stock optionnels</p>
        </div>
        <button (click)="refreshAlerts()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 flex-wrap">
        <button 
          (click)="setFilter('all')"
          [class.bg-orange-500]="filter() === 'all'"
          [class.bg-neutral-700]="filter() !== 'all'"
          class="px-4 py-2 rounded-lg text-white font-semibold transition-colors">
          Tous ({{ allAlerts().length }})
        </button>
        <button 
          (click)="setFilter('critical')"
          [class.bg-red-600]="filter() === 'critical'"
          [class.bg-neutral-700]="filter() !== 'critical'"
          class="px-4 py-2 rounded-lg text-white font-semibold transition-colors">
          🔴 Critiques ({{ criticalAlerts().length }})
        </button>
        <button 
          (click)="setFilter('low')"
          [class.bg-yellow-600]="filter() === 'low'"
          [class.bg-neutral-700]="filter() !== 'low'"
          class="px-4 py-2 rounded-lg text-white font-semibold transition-colors">
          🟡 Faible ({{ lowAlerts().length }})
        </button>
        <button 
          (click)="setFilter('managed')"
          [class.bg-blue-600]="filter() === 'managed'"
          [class.bg-neutral-700]="filter() !== 'managed'"
          class="px-4 py-2 rounded-lg text-white font-semibold transition-colors">
          ✅ Gérés ({{ managedAlerts().length }})
        </button>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <p class="text-sm text-blue-300">
          ℹ️ <span class="font-semibold">Note:</span> La gestion de stock est complètement optionnelle. 
          Vous pouvez laisser vides les seuils pour les produits sans gestion de stock.
        </p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- Alerts Table -->
      <div *ngIf="!isLoading() && filteredAlerts().length > 0" class="space-y-4">
        <div *ngFor="let product of filteredAlerts()" class="bg-neutral-800 rounded-lg border transition-all" [ngClass]="getAlertBorderClass(product)">
          <div class="p-4">
            <!-- Header -->
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white">{{ product.name }}</h3>
                <p class="text-xs text-neutral-400">{{ product.category }}</p>
              </div>
              <span [class]="getAlertBadgeClass(product)" class="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                {{ getAlertLabel(product) }}
              </span>
            </div>

            <!-- Stock Info -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-neutral-700">
              <!-- Current Stock -->
              <div>
                <p class="text-xs text-neutral-400 mb-1">Stock Actuel</p>
                <p class="text-2xl font-bold text-white">{{ product.quantity }}</p>
                <p class="text-xs text-neutral-500">{{ product.unit }}</p>
              </div>

              <!-- Min Threshold -->
              <div>
                <p class="text-xs text-neutral-400 mb-1">Stock Min</p>
                <p class="text-2xl font-bold" [class]="product.minimumStock ? 'text-orange-400' : 'text-neutral-500'">
                  {{ product.minimumStock || '-' }}
                </p>
                <p class="text-xs text-neutral-500">{{ product.minimumStock ? product.unit : 'Non défini' }}</p>
              </div>

              <!-- Max Threshold -->
              <div>
                <p class="text-xs text-neutral-400 mb-1">Stock Max</p>
                <p class="text-2xl font-bold" [class]="product.maximumStock ? 'text-green-400' : 'text-neutral-500'">
                  {{ product.maximumStock || '-' }}
                </p>
                <p class="text-xs text-neutral-500">{{ product.maximumStock ? product.unit : 'Non défini' }}</p>
              </div>

              <!-- To Order -->
              <div>
                <p class="text-xs text-neutral-400 mb-1">À Commander</p>
                <p class="text-2xl font-bold" [class]="getToOrderQuantity(product) > 0 ? 'text-red-400' : 'text-green-400'">
                  {{ getToOrderQuantity(product) }}
                </p>
                <p class="text-xs text-neutral-500">{{ product.unit }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button 
                (click)="openEditModal(product)"
                class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors">
                ⚖️ Ajuster Seuils
              </button>
              <button 
                (click)="openQuickAdjustModal(product)"
                class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors">
                ➕ Ajuster Stock
              </button>
              <button 
                *ngIf="product.minimumStock"
                (click)="removeThresholds(product)"
                class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors">
                ✕ Retirer Gestion
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Alerts -->
      <div *ngIf="!isLoading() && filteredAlerts().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
        <p class="text-neutral-400 text-lg">
          <span *ngIf="filter() === 'all'">✅ Aucune alerte stock</span>
          <span *ngIf="filter() === 'critical'">Aucun produit critique</span>
          <span *ngIf="filter() === 'low'">Aucun produit en faible stock</span>
          <span *ngIf="filter() === 'managed'">Aucun produit géré</span>
        </p>
      </div>

      <!-- Edit Modal -->
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 max-w-md w-full border border-neutral-700">
          <h2 class="text-2xl font-bold text-white mb-4">Ajuster les Seuils</h2>
          
          <div *ngIf="editingProduct" class="bg-neutral-700 rounded p-3 mb-4">
            <p class="text-sm text-neutral-400">Produit</p>
            <p class="text-white font-bold">{{ editingProduct.name }}</p>
          </div>

          <form [formGroup]="thresholdForm" (ngSubmit)="saveThresholds()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Stock Minimum (optionnel)</label>
              <input 
                formControlName="minimumStock"
                type="number" 
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="Ex: 10">
              <p class="text-xs text-neutral-500 mt-1">Laissez vide pour désactiver la gestion de ce produit</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Stock Maximum (optionnel)</label>
              <input 
                formControlName="maximumStock"
                type="number" 
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="Ex: 100">
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="closeEditModal()" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button type="submit" [disabled]="isSaving()" class="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Quick Adjust Modal -->
      <div *ngIf="showQuickAdjustModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 max-w-md w-full border border-neutral-700">
          <h2 class="text-2xl font-bold text-white mb-4">Ajuster le Stock</h2>
          
          <div *ngIf="editingProduct" class="bg-neutral-700 rounded p-3 mb-4">
            <p class="text-sm text-neutral-400">{{ editingProduct.name }}</p>
            <p class="text-white font-bold">Stock actuel: {{ editingProduct.quantity }} {{ editingProduct.unit }}</p>
          </div>

          <form [formGroup]="quickAdjustForm" (ngSubmit)="saveQuickAdjust()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Type</label>
              <select formControlName="type" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
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
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="0">
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="closeQuickAdjustModal()" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button type="submit" [disabled]="isSaving()" class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : 'Confirmer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="success()" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold">
        ✅ {{ success() }}
      </div>
    </div>
  `,
  styles: []
})
export class StockAlertsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  filter = signal<'all' | 'critical' | 'low' | 'managed'>('all');

  allAlerts = signal<any[]>([]);
  showEditModal = false;
  showQuickAdjustModal = false;
  editingProduct: any = null;

  thresholdForm: FormGroup;
  quickAdjustForm: FormGroup;

  constructor() {
    this.thresholdForm = this.fb.group({
      minimumStock: [''],
      maximumStock: ['']
    });

    this.quickAdjustForm = this.fb.group({
      type: ['ADD', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.isLoading.set(true);
    this.apiService.getStocks().subscribe({
      next: (data) => {
        const alerts = data.map((item: any) => ({
          ...item,
          unit: item.unit || 'pcs',
          name: item.product?.name || item.productName || 'Produit inconnu',
          category: item.product?.category?.name || 'Général'
        }));
        this.allAlerts.set(alerts);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement');
        this.isLoading.set(false);
      }
    });
  }

  criticalAlerts(): any[] {
    return this.allAlerts().filter(p => p.quantity <= p.minimumStock);
  }

  lowAlerts(): any[] {
    return this.allAlerts().filter(p => p.quantity > p.minimumStock && p.quantity <= p.minimumStock * 1.5);
  }

  managedAlerts(): any[] {
    return this.allAlerts().filter(p => p.minimumStock);
  }

  filteredAlerts(): any[] {
    switch (this.filter()) {
      case 'critical': return this.criticalAlerts();
      case 'low': return this.lowAlerts();
      case 'managed': return this.managedAlerts();
      default: return this.allAlerts();
    }
  }

  setFilter(value: 'all' | 'critical' | 'low' | 'managed'): void {
    this.filter.set(value);
  }

  getAlertLabel(product: any): string {
    if (!product.minimumStock) return 'Non géré';
    if (product.quantity <= product.minimumStock) return 'CRITIQUE';
    if (product.quantity <= product.minimumStock * 1.5) return 'FAIBLE';
    return 'BON';
  }

  getAlertBadgeClass(product: any): string {
    if (!product.minimumStock) return 'bg-neutral-700 text-neutral-300';
    if (product.quantity <= product.minimumStock) return 'bg-red-900/30 text-red-300';
    if (product.quantity <= product.minimumStock * 1.5) return 'bg-yellow-900/30 text-yellow-300';
    return 'bg-green-900/30 text-green-300';
  }

  getAlertBorderClass(product: any): string {
    if (!product.minimumStock) return 'border-neutral-700';
    if (product.quantity <= product.minimumStock) return 'border-red-600 bg-red-900/10';
    if (product.quantity <= product.minimumStock * 1.5) return 'border-yellow-600 bg-yellow-900/10';
    return 'border-green-600 bg-green-900/10';
  }

  getToOrderQuantity(product: any): number {
    if (!product.minimumStock) return 0;
    return Math.max(0, product.minimumStock - product.quantity);
  }

  openEditModal(product: any): void {
    this.editingProduct = product;
    this.thresholdForm.patchValue({
      minimumStock: product.minimumStock || '',
      maximumStock: product.maximumStock || ''
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveThresholds(): void {
    this.isSaving.set(true);
    const { minimumStock, maximumStock } = this.thresholdForm.value;
    
    this.apiService.adjustStock(this.editingProduct.publicId, 0, 'THRESHOLD_UPDATE').subscribe({
      next: () => {
        this.isSaving.set(false);
        this.success.set('Seuils enregistrés');
        this.closeEditModal();
        this.loadAlerts();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.error.set('Erreur');
      }
    });
  }

  openQuickAdjustModal(product: any): void {
    this.editingProduct = product;
    this.quickAdjustForm.reset({ type: 'ADD', quantity: 0 });
    this.showQuickAdjustModal = true;
  }

  closeQuickAdjustModal(): void {
    this.showQuickAdjustModal = false;
  }

  saveQuickAdjust(): void {
    if (!this.quickAdjustForm.valid) return;
    
    this.isSaving.set(true);
    const { type, quantity } = this.quickAdjustForm.value;
    let quantityChange = quantity;
    
    if (type === 'REMOVE') quantityChange = -quantity;
    else if (type === 'SET') quantityChange = quantity - this.editingProduct.quantity;
    
    this.apiService.adjustStock(this.editingProduct.publicId, quantityChange, type).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.success.set('Stock ajusté');
        this.closeQuickAdjustModal();
        this.loadAlerts();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.error.set('Erreur');
      }
    });
  }

  removeThresholds(product: any): void {
    if (confirm(`Retirer la gestion de stock pour ${product.name}?`)) {
      this.editingProduct = product;
      this.thresholdForm.patchValue({ minimumStock: '', maximumStock: '' });
      this.saveThresholds();
    }
  }

  refreshAlerts(): void {
    this.loadAlerts();
    this.toast.success('Alertes rafraîchies');
  }
}
