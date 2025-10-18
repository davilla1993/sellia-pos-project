import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 p-6 bg-neutral-900 min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-white">Mes Commandes</h1>
        <button (click)="loadOrders()" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded font-medium transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Status Filters -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button *ngFor="let status of statusList"
          (click)="selectedStatus.set(status)"
          [class.bg-primary]="selectedStatus() === status"
          [class.bg-neutral-700]="selectedStatus() !== status"
          [class.text-white]="selectedStatus() === status"
          [class.text-neutral-300]="selectedStatus() !== status"
          class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm">
          {{ formatStatus(status) }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Orders List -->
      <div *ngIf="!isLoading() && filteredOrders().length > 0" class="grid gap-4">
        <div *ngFor="let order of filteredOrders()" class="bg-neutral-800 rounded-lg border border-neutral-700 p-4 space-y-3">
          <!-- Order Header -->
          <div class="flex justify-between items-start">
            <div>
              <p class="text-lg font-bold text-white">Commande #{{ order.orderNumber }}</p>
              <p class="text-sm text-neutral-400">Table: {{ order.table?.number }} - {{ order.table?.name }}</p>
              <p class="text-xs text-neutral-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <span [class]="getStatusBadgeClass(order.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <!-- Order Items -->
          <div class="bg-neutral-700 rounded p-3 space-y-2">
            <p class="text-xs text-neutral-400 uppercase font-semibold">Items ({{ order.items?.length || 0 }})</p>
            <div *ngFor="let item of order.items" class="flex justify-between text-sm">
              <span class="text-neutral-300">{{ item.quantity }}x {{ item.product.name }}</span>
              <span class="text-neutral-400">FCFA {{ (item.totalPrice / 100).toFixed(0) }}</span>
            </div>
          </div>

          <!-- Order Total -->
          <div class="flex justify-between items-center pt-2 border-t border-neutral-600">
            <span class="text-neutral-300">Total:</span>
            <span class="text-xl font-bold text-primary">FCFA {{ (order.totalAmount / 100).toFixed(0) }}</span>
          </div>

          <!-- Status Badges -->
          <div class="flex gap-2 flex-wrap">
            <span *ngIf="order.isPaid" class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
              ✓ Payé
            </span>
            <span *ngIf="!order.isPaid && order.status === 'PRETE'" class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">
              ⚠ À encaisser
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button *ngIf="order.status === 'PRETE' && !order.isPaid"
              (click)="goToCheckout(order)"
              class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors text-sm">
              💳 Encaisser
            </button>
            <button *ngIf="isNextStatusAllowed(order.status)"
              (click)="updateStatus(order.publicId, getNextStatus(order.status))"
              [disabled]="updatingOrderId() === order.publicId"
              class="flex-1 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded transition-colors text-sm">
              {{ updatingOrderId() === order.publicId ? '⏳' : getNextStatusLabel(order.status) }}
            </button>
          </div>
        </div>
      </div>

      <!-- No Orders -->
      <div *ngIf="!isLoading() && filteredOrders().length === 0" class="flex items-center justify-center h-64 text-neutral-400">
        <p>Aucune commande avec le statut: {{ formatStatus(selectedStatus()) }}</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage()" class="bg-red-500/10 border border-red-500 text-red-400 rounded p-4">
        {{ errorMessage() }}
      </div>
    </div>
  `,
  styles: []
})
export class MyOrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  orders = signal<any[]>([]);
  selectedStatus = signal('ACCEPTEE');
  isLoading = signal(false);
  updatingOrderId = signal<string | null>(null);
  errorMessage = signal('');

  statusList = ['ACCEPTEE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE', 'PAYEE'];

  ngOnInit(): void {
    this.loadOrders();
    setInterval(() => this.loadOrders(), 10000);
  }

  filteredOrders() {
    return this.orders().filter(o => o.status === this.selectedStatus());
  }

  loadOrders(): void {
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

  isNextStatusAllowed(status: string): boolean {
    return ['ACCEPTEE', 'EN_PREPARATION'].includes(status);
  }

  getNextStatus(status: string): string {
    const map: { [key: string]: string } = {
      'ACCEPTEE': 'EN_PREPARATION',
      'EN_PREPARATION': 'PRETE'
    };
    return map[status] || status;
  }

  getNextStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACCEPTEE': '→ Préparation',
      'EN_PREPARATION': '→ Prête'
    };
    return labels[status] || 'Suivant';
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
