import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../shared/services/currency.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  private apiService = inject(ApiService);
  public currencyService = inject(CurrencyService);

  orders = signal<any[]>([]);
  selectedStatus = signal('ACCEPTEE');
  searchTerm = signal('');
  isLoading = signal(false);
  updatingOrderId = signal<string | null>(null);
  errorMessage = signal('');
  currentPage = signal(0);
  pageSize = 10;

  statusList = ['ACCEPTEE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE', 'PAYEE'];

  totalPages = computed(() => {
    const filtered = this.filteredOrders();
    return Math.ceil(filtered.length / this.pageSize) || 1;
  });

  ngOnInit(): void {
    this.loadOrders();
    setInterval(() => this.loadOrders(), 10000);
  }

  filteredOrders() {
    let filtered = this.orders().filter(o => o.status === this.selectedStatus());
    
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(o => o.orderNumber.toLowerCase().includes(term));
    }
    
    return filtered;
  }

  paginatedOrders() {
    const filtered = this.filteredOrders();
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    return filtered.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  changeStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
  }

  loadOrders(): void {
    this.currentPage.set(0);
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    // Load all statuses
    Promise.all([
      this.loadByStatus('ACCEPTEE'),
      this.loadByStatus('EN_PREPARATION'),
      this.loadByStatus('PRETE'),
      this.loadByStatus('LIVREE'),
      this.loadByStatus('ANNULEE'),
      this.loadByStatus('PAYEE')
    ]).then(() => {
      this.isLoading.set(false);
    }).catch(() => {
      this.errorMessage.set('Erreur lors du chargement des commandes');
      this.isLoading.set(false);
    });
  }

  private loadByStatus(status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getOrdersByStatus(status).subscribe({
        next: (response: any) => {
          const data = response.content || response.data || response || [];
          const newOrders = Array.isArray(data) ? data : [];
          this.orders.update(current => [
            ...current.filter(o => o.status !== status),
            ...newOrders
          ]);
          resolve();
        },
        error: () => reject()
      });
    });
  }

  updateStatus(publicId: string, newStatus: string): void {
    this.updatingOrderId.set(publicId);
    
    this.apiService.updateOrderStatus(publicId, newStatus).subscribe({
      next: () => {
        this.updatingOrderId.set(null);
        this.loadOrders();
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la mise à jour du statut');
        this.updatingOrderId.set(null);
      }
    });
  }

  goToCheckout(order: any): void {
    // TODO: Navigate to checkout with table ID
    console.log('Go to checkout for order:', order.publicId);
  }

  canCancelOrder(status: string): boolean {
    return ['ACCEPTEE'].includes(status);
  }

  cancelOrder(publicId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    this.updatingOrderId.set(publicId);
    
    this.apiService.updateOrderStatus(publicId, 'ANNULEE').subscribe({
      next: () => {
        this.updatingOrderId.set(null);
        this.loadOrders();
      },
      error: () => {
        this.errorMessage.set('Erreur lors de l\'annulation de la commande');
        this.updatingOrderId.set(null);
      }
    });
  }

  formatStatus(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': '⏳ En attente',
      'ACCEPTEE': '✓ Acceptée',
      'EN_PREPARATION': '🍳 En préparation',
      'PRETE': '📦 Prête',
      'LIVREE': '✓ Livrée',
      'ANNULEE': '✕ Annulée',
      'PAYEE': '💳 Payée'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'bg-yellow-500/20 text-yellow-400',
      'ACCEPTEE': 'bg-blue-500/20 text-blue-400',
      'EN_PREPARATION': 'bg-orange-500/20 text-orange-400',
      'PRETE': 'bg-purple-500/20 text-purple-400',
      'LIVREE': 'bg-green-500/20 text-green-400',
      'ANNULEE': 'bg-red-500/20 text-red-400',
      'PAYEE': 'bg-green-600/20 text-green-300'
    };
    return classes[status] || 'bg-neutral-700 text-neutral-300';
  }

  formatDate(date: any): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }


}

