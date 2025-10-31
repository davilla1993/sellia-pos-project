import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stock-alerts.component.html',
  styleUrls: ['./stock-alerts.component.css']
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
