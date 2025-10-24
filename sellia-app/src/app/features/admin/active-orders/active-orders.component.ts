import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-active-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Commandes en Temps Réel</h1>
          <p class="text-neutral-400">Suivi de toutes les commandes actives</p>
        </div>
        <button (click)="refreshOrders()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-4 border-b border-neutral-700 overflow-x-auto">
        <button 
          *ngFor="let status of orderStatuses"
          (click)="setFilter(status.value)"
          [class.border-b-2]="filter() === status.value"
          [class.border-orange-500]="filter() === status.value"
          [class.text-white]="filter() === status.value"
          [class.text-neutral-400]="filter() !== status.value"
          class="pb-2 font-semibold transition-colors whitespace-nowrap">
          {{ status.label }} ({{ getStatusCount(status.value) }})
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">En attente</p>
              <p class="text-3xl font-bold text-yellow-500">{{ getStatusCount('EN_ATTENTE') }}</p>
            </div>
            <div class="text-4xl opacity-30">⏳</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">En préparation</p>
              <p class="text-3xl font-bold text-blue-500">{{ getStatusCount('EN_PREPARATION') }}</p>
            </div>
            <div class="text-4xl opacity-30">👨‍🍳</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Prêtes</p>
              <p class="text-3xl font-bold text-green-500">{{ getStatusCount('PRETE') }}</p>
            </div>
            <div class="text-4xl opacity-30">✅</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Total CA</p>
              <p class="text-3xl font-bold text-green-400">{{ formatCurrency(totalAmount()) }}</p>
            </div>
            <div class="text-4xl opacity-30">💰</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- Orders Table -->
      <div *ngIf="!isLoading() && filteredOrders().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-neutral-700 border-b border-neutral-600">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-white">N° Cmd</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Table</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Articles</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Statut</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Caissier</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Montant</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Depuis</th>
              <th class="px-4 py-3 text-left font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
              <!-- N° Cmd -->
              <td class="px-4 py-4 font-bold text-orange-400">
                #{{ order.orderNumber }}
              </td>

              <!-- Table -->
              <td class="px-4 py-4 text-white">
                <div *ngIf="order.tableNumber">Table {{ order.tableNumber }}</div>
                <div *ngIf="!order.tableNumber" class="text-neutral-500">À emporter</div>
              </td>

              <!-- Articles -->
              <td class="px-4 py-4">
                <div class="text-neutral-300">
                  <div *ngFor="let item of getOrderItems(order) | slice:0:2" class="text-xs">
                    {{ item.quantity }}x {{ item.productName }}
                  </div>
                  <div *ngIf="getOrderItems(order).length > 2" class="text-xs text-neutral-500">
                    +{{ getOrderItems(order).length - 2 }} article(s)
                  </div>
                </div>
              </td>

              <!-- Statut -->
              <td class="px-4 py-4">
                <span [class]="getOrderStatusClass(order.status)" class="px-2 py-1 rounded text-xs font-semibold">
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </td>

              <!-- Caissier -->
              <td class="px-4 py-4 text-sm text-neutral-400">
                {{ order.cashierSessionCashierName }}
              </td>

              <!-- Montant -->
              <td class="px-4 py-4 font-semibold text-green-400">
                {{ formatCurrency(order.totalAmount) }}
              </td>

              <!-- Depuis -->
              <td class="px-4 py-4 text-xs text-neutral-500">
                {{ getTimeDifference(order.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-4">
                <button 
                  (click)="toggleOrderDetails(order.publicId)"
                  class="text-blue-400 hover:text-blue-300 font-medium text-xs">
                  👁️ Détails
                </button>
              </td>
            </tr>

            <!-- Order Details Row (Expandable) -->
            <tr *ngFor="let order of filteredOrders()" [class.hidden]="expandedOrderId() !== order.publicId" class="bg-neutral-700/30 border-b border-neutral-700">
              <td colspan="8" class="px-4 py-4">
                <div class="space-y-4">
                  <div>
                    <h4 class="text-white font-bold mb-2">Détails de la commande</h4>
                    <div class="bg-neutral-800 rounded p-3 space-y-2">
                      <div *ngFor="let item of getOrderItems(order)" class="flex justify-between text-sm">
                        <span class="text-neutral-300">{{ item.quantity }}x {{ item.productName }}</span>
                        <span class="text-neutral-400">{{ formatCurrency(item.totalPrice) }}</span>
                      </div>
                      <div class="border-t border-neutral-600 pt-2 flex justify-between font-semibold text-white">
                        <span>Total:</span>
                        <span>{{ formatCurrency(order.totalAmount) }}</span>
                      </div>
                      <div *ngIf="order.discount > 0" class="text-red-400 text-sm">
                        Remise: -{{ formatCurrency(order.discount) }}
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredOrders().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
        <p class="text-neutral-400 text-lg">Aucune commande {{ getCurrentStatusLabel() }}</p>
      </div>

      <!-- Error Toast -->
      <div *ngIf="error()" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg">
        {{ error() }}
      </div>
    </div>
  `,
  styles: []
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
