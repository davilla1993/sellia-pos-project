import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';
import { CurrencyService } from '@shared/services/currency.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-active-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-orders.component.html',
  styleUrls: ['./active-orders.component.css']
})
export class ActiveOrdersComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  currencyService = inject(CurrencyService);

  allOrders = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  filter = signal<string>('ALL');
  expandedOrderId = signal<string | null>(null);

  orderStatuses = [
    { value: 'ALL', label: 'Toutes' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_PREPARATION', label: 'En préparation' },
    { value: 'PRETE', label: 'Prêtes' },
    { value: 'LIVREE', label: 'Livrées' }
  ];

  private refreshSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadOrders();
    this.refreshSubscription = interval(20000).subscribe(() => {
      this.loadOrders();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.apiService.getActiveOrders().subscribe({
      next: (data) => {
        this.allOrders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement');
        this.isLoading.set(false);
      }
    });
  }

  filteredOrders(): any[] {
    const filter = this.filter();
    if (filter === 'ALL') {
      return this.allOrders();
    }
    return this.allOrders().filter(o => o.status === filter);
  }

  setFilter(status: string): void {
    this.filter.set(status);
  }

  getStatusCount(status: string): number {
    if (status === 'ALL') {
      return this.allOrders().length;
    }
    return this.allOrders().filter(o => o.status === status).length;
  }

  getOrderStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_PREPARATION': 'En préparation',
      'PRETE': 'Prête',
      'LIVREE': 'Livrée',
      'ANNULEE': 'Annulée',
      'PAYEE': 'Payée'
    };
    return labels[status] || status;
  }

  getOrderStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'bg-yellow-900/30 text-yellow-300',
      'EN_PREPARATION': 'bg-blue-900/30 text-blue-300',
      'PRETE': 'bg-green-900/30 text-green-300',
      'LIVREE': 'bg-purple-900/30 text-purple-300',
      'ANNULEE': 'bg-red-900/30 text-red-300',
      'PAYEE': 'bg-gray-900/30 text-gray-300'
    };
    return classes[status] || 'bg-gray-900/30 text-gray-300';
  }

  getTimeDifference(createdAt: string): string {
    if (!createdAt) return 'N/A';
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - created;
    
    const minutes = Math.floor(diffMs / 1000 / 60);
    const seconds = Math.floor((diffMs / 1000) % 60);
    
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const amountInFcfa = Math.round(value / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }

  totalAmount(): number {
    return this.filteredOrders().reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  toggleOrderDetails(orderId: string): void {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  getCurrentStatusLabel(): string {
    const current = this.orderStatuses.find(s => s.value === this.filter());
    return current?.label.toLowerCase() || '';
  }

  refreshOrders(): void {
    this.loadOrders();
    this.toast.success('Commandes rafraîchies');
  }

  getOrderItems(order: any): any[] {
    return order.items || [];
  }
}
