import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-pending-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-3 p-3 bg-neutral-900 min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white">Commandes en Attente</h1>
          <p class="text-neutral-400 text-sm">Total: <span class="font-bold text-primary">{{ orders().length }}</span></p>
        </div>
        <button (click)="loadOrders()" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded font-medium transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Orders List -->
      <div *ngIf="!isLoading() && orders().length > 0" class="grid gap-4">
        <div *ngFor="let order of orders()" class="bg-neutral-800 rounded-lg border border-neutral-700 p-4 space-y-3">
          <!-- Order Header -->
          <div class="flex justify-between items-start">
            <div>
              <p class="text-lg font-bold text-white">Commande #{{ order.orderNumber }}</p>
              <p class="text-sm text-neutral-400">Table: {{ order.table?.number }} - {{ order.table?.name }}</p>
            </div>
            <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
              {{ order.status }}
            </span>
          </div>

          <!-- Order Items -->
          <div class="bg-neutral-700 rounded p-3 space-y-2">
            <p class="text-xs text-neutral-400 uppercase font-semibold">Items</p>
            <div *ngFor="let item of order.items" class="flex justify-between text-sm">
              <span class="text-neutral-300">{{ item.quantity }}x {{ item.product.name }}</span>
              <span class="text-neutral-400">{{ item.product.preparationTime }} min</span>
            </div>
          </div>

          <!-- Order Notes -->
          <div *ngIf="order.notes" class="bg-neutral-700 rounded p-3">
            <p class="text-xs text-neutral-400 uppercase font-semibold mb-2">Notes</p>
            <p class="text-sm text-neutral-300">{{ order.notes }}</p>
          </div>

          <!-- Order Total -->
          <div class="flex justify-between items-center">
            <span class="text-neutral-300">Total:</span>
            <span class="text-xl font-bold text-primary">FCFA {{ (order.totalAmount / 100).toFixed(0) }}</span>
          </div>

          <!-- Accept Button -->
          <button (click)="acceptOrder(order.publicId)" 
            [disabled]="acceptingOrderId() === order.publicId"
            class="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors">
            {{ acceptingOrderId() === order.publicId ? '⏳ Traitement...' : '✓ Accepter cette commande' }}
          </button>
        </div>
      </div>

      <!-- No Orders -->
      <div *ngIf="!isLoading() && orders().length === 0" class="flex items-center justify-center h-64 text-neutral-400">
        <p>Aucune commande en attente</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage()" class="bg-red-500/10 border border-red-500 text-red-400 rounded p-4">
        {{ errorMessage() }}
      </div>
    </div>
  `,
  styles: []
})
export class PendingOrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  orders = signal<any[]>([]);
  isLoading = signal(false);
  acceptingOrderId = signal<string | null>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadOrders();
    // Reload every 10 seconds
    setInterval(() => this.loadOrders(), 10000);
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.apiService.getOrdersByStatus('EN_ATTENTE').subscribe({
      next: (response: any) => {
        const data = response?.content || response?.data || response || [];
        const ordersArray = Array.isArray(data) ? data : [];
        this.orders.set(ordersArray);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.errorMessage.set('Erreur lors du chargement des commandes');
        this.isLoading.set(false);
      }
    });
  }

  acceptOrder(publicId: string): void {
    this.acceptingOrderId.set(publicId);
    
    this.apiService.updateOrderStatus(publicId, 'ACCEPTEE').subscribe({
      next: () => {
        this.acceptingOrderId.set(null);
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de l\'acceptation de la commande');
        this.acceptingOrderId.set(null);
      }
    });
  }
}
