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
  paidOrdersToday = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  filter = signal<string>('ALL');
  selectedOrder = signal<any | null>(null);
  showModal = signal(false);

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
    this.loadPaidOrdersToday();
    this.refreshSubscription = interval(20000).subscribe(() => {
      this.loadOrders();
      this.loadPaidOrdersToday();
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
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }

  totalAmount(): number {
    return this.filteredOrders().reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  loadPaidOrdersToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = tomorrow.toISOString();

    this.apiService.getOrdersByPaidDateRange(startDate, endDate).subscribe({
      next: (response: any) => {
        const orders = response.content || response.data || response || [];
        this.paidOrdersToday.set(Array.isArray(orders) ? orders : []);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des commandes payées');
      }
    });
  }

  paidAmount(): number {
    return this.paidOrdersToday().reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  openOrderDetails(order: any): void {
    this.selectedOrder.set(order);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedOrder.set(null);
  }

  getCurrentStatusLabel(): string {
    const current = this.orderStatuses.find(s => s.value === this.filter());
    return current?.label.toLowerCase() || '';
  }

  refreshOrders(): void {
    this.loadOrders();
    this.loadPaidOrdersToday();
    this.toast.success('Commandes rafraîchies');
  }

  getOrderItems(order: any): any[] {
    return order.items || [];
  }
}
