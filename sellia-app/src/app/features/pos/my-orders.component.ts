import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../shared/services/currency.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-full bg-neutral-900 overflow-hidden">
      <!-- Left Sidebar: Filters -->
      <div class="w-64 bg-neutral-800 border-r border-neutral-700 p-6 overflow-y-auto flex flex-col gap-6 pt-16">
        <div>
          <h2 class="text-lg font-bold text-white mb-4">Statuts</h2>
          <div class="flex flex-col gap-3">
            <button *ngFor="let status of statusList"
              (click)="changeStatus(status)"
              [class.bg-primary]="selectedStatus() === status"
              [class.bg-neutral-700]="selectedStatus() !== status"
              [class.text-white]="selectedStatus() === status"
              [class.text-neutral-300]="selectedStatus() !== status"
              class="w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm text-left">
              {{ formatStatus(status) }}
            </button>
          </div>
        </div>
        
        <div class="border-t border-neutral-700 pt-6">
          <button (click)="loadOrders()" class="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded font-medium transition-colors text-sm">
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      <!-- Right Content: Orders List -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-6 pt-12 border-b border-neutral-700">
          <div class="flex justify-between items-center gap-6 mb-2">
            <h1 class="text-3xl font-bold text-white">Mes Commandes</h1>
            <input 
              [(ngModel)]="searchTerm"
              (input)="currentPage.set(0)"
              type="text"
              placeholder="Chercher par #..."
              class="w-80 px-4 py-2 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-500 text-sm"
            />
          </div>
          <p class="text-neutral-400 text-sm">{{ formatStatus(selectedStatus()) }} ({{ filteredOrders().length }})</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex-1 flex justify-center items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Orders List -->
        <div *ngIf="!isLoading() && filteredOrders().length > 0" class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div *ngFor="let order of paginatedOrders()" class="bg-neutral-800 rounded-lg border border-neutral-700 p-3 space-y-2">
          <!-- Order Header -->
          <div class="flex justify-between items-start">
            <div>
              <p class="text-base font-bold text-white">{{ order.orderNumber }}</p>
              <p class="text-xs text-neutral-400">{{ order.table?.number }} • {{ formatDate(order.createdAt) }}</p>
            </div>
            <span [class]="getStatusBadgeClass(order.status)" class="px-2 py-0.5 rounded-full text-xs font-semibold">
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <!-- Order Items -->
          <div class="bg-neutral-700 rounded p-2 space-y-1">
            <p class="text-xs text-neutral-400 uppercase font-semibold mb-1">{{ order.items?.length || 0 }} item(s)</p>
            <div *ngFor="let item of order.items" class="flex justify-between text-xs">
              <span class="text-neutral-300">{{ item.quantity }}x {{ item.product.name }}</span>
              <span class="text-neutral-400">{{ currencyService.formatPrice(item.totalPrice) }}</span>
            </div>
          </div>

          <!-- Order Total -->
          <div class="flex justify-between items-center pt-1 border-t border-neutral-600">
            <span class="text-sm text-neutral-300">Total:</span>
            <span class="text-lg font-bold text-primary">{{ currencyService.formatPrice(order.totalAmount) }}</span>
          </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button *ngIf="order.status === 'PRETE' && !order.isPaid"
                (click)="goToCheckout(order)"
                class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors text-sm">
                💳 Encaisser
              </button>
              <button *ngIf="canCancelOrder(order.status)"
                (click)="cancelOrder(order.publicId)"
                [disabled]="updatingOrderId() === order.publicId"
                class="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded transition-colors text-sm">
                {{ updatingOrderId() === order.publicId ? '⏳' : '✕ Annuler' }}
              </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="totalPages() > 1" class="border-t border-neutral-700 p-6 flex items-center justify-between bg-neutral-800">
            <div class="text-neutral-400 text-sm">
              Page {{ currentPage() + 1 }} / {{ totalPages() }} - {{ filteredOrders().length }} commandes
            </div>
            <div class="flex gap-2">
              <button 
                (click)="previousPage()"
                [disabled]="currentPage() === 0"
                class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors text-sm">
                ← Précédent
              </button>
              <button 
                (click)="nextPage()"
                [disabled]="currentPage() >= totalPages() - 1"
                class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors text-sm">
                Suivant →
              </button>
            </div>
          </div>
        </div>

        <!-- No Orders -->
        <div *ngIf="!isLoading() && filteredOrders().length === 0" class="flex-1 flex items-center justify-center text-neutral-400">
          <p>Aucune commande avec le statut: {{ formatStatus(selectedStatus()) }}</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage()" class="bg-red-500/10 border border-red-500 text-red-400 rounded p-4 m-6">
          {{ errorMessage() }}
        </div>
      </div>
    </div>
  `,
  styles: []
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

