import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
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
