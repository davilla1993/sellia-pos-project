import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

interface KitchenOrder {
  publicId: string;
  orderNumber: string;
  table?: {
    number: string;
    name: string;
  };
  status: string;
  items: any[];
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

@Component({
  selector: 'app-kitchen-kanban',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-neutral-900 p-6 overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">👨‍🍳 Interface Cuisine</h1>
          <p class="text-neutral-400 text-sm">Gestion des commandes en temps réel</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="refreshOrders()" class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition-colors">
            🔄 Rafraîchir
          </button>
          <div class="bg-primary text-white rounded-lg px-4 py-2 font-bold text-lg">
            Commandes en cours: {{ activeOrdersCount() }}
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        <!-- En Attente Column -->
        <div class="flex flex-col bg-red-50 rounded-lg border-2 border-red-300 overflow-hidden">
          <div class="bg-red-200 px-4 py-3 border-b-2 border-red-300">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-red-800 text-lg">⏳ En attente</h2>
              <span class="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
                {{ ordersbyStatus('EN_ATTENTE').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-3">
            <div *ngFor="let order of ordersbyStatus('EN_ATTENTE')" class="bg-white rounded-lg border-2 border-red-300 p-4 shadow-md cursor-move hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{ order.table?.number || 'Takeaway' }}</h3>
                  <p class="text-sm text-gray-600">{{ order.table?.name }}</p>
                </div>
                <span *ngIf="isUrgent(order)" class="bg-red-600 text-white px-2 py-1 rounded font-bold text-xs">URGENT</span>
              </div>
              
              <div class="text-sm text-gray-700 mb-3">
                <p class="font-semibold">{{ getElapsedTime(order.createdAt) }}</p>
              </div>

              <div class="space-y-1 mb-3 text-sm">
                <div *ngFor="let item of order.items" class="flex justify-between">
                  <span class="text-gray-800">{{ item.quantity }}x {{ item.product?.name }}</span>
                  <span *ngIf="getCategoryTag(item)" [ngClass]="getCategoryClass(item)" class="px-2 py-1 rounded text-xs font-semibold">
                    {{ getCategoryTag(item) }}
                  </span>
                </div>
              </div>

              <div *ngIf="order.notes" class="bg-yellow-100 border-l-4 border-yellow-500 p-2 mb-3 rounded text-xs text-yellow-900">
                <p class="font-semibold">📝 Notes:</p>
                <p class="italic">{{ order.notes }}</p>
              </div>

              <button 
                (click)="updateOrderStatus(order.publicId, 'EN_PREPARATION')"
                class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition-colors">
                Commencer la préparation
              </button>
            </div>
          </div>
        </div>

        <!-- En Préparation Column -->
        <div class="flex flex-col bg-yellow-50 rounded-lg border-2 border-yellow-300 overflow-hidden">
          <div class="bg-yellow-200 px-4 py-3 border-b-2 border-yellow-300">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-yellow-800 text-lg">👨‍🍳 En préparation</h2>
              <span class="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
                {{ ordersbyStatus('EN_PREPARATION').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-3">
            <div *ngFor="let order of ordersbyStatus('EN_PREPARATION')" class="bg-white rounded-lg border-2 border-yellow-300 p-4 shadow-md cursor-move hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{ order.table?.number || 'Takeaway' }}</h3>
                  <p class="text-sm text-gray-600">{{ order.table?.name }}</p>
                </div>
              </div>
              
              <div class="text-sm text-yellow-700 mb-3">
                <p class="font-semibold">{{ getElapsedTime(order.createdAt) }}</p>
              </div>

              <div class="space-y-1 mb-3 text-sm">
                <div *ngFor="let item of order.items" class="flex justify-between">
                  <span class="text-gray-800">{{ item.quantity }}x {{ item.product?.name }}</span>
                  <span *ngIf="getCategoryTag(item)" [ngClass]="getCategoryClass(item)" class="px-2 py-1 rounded text-xs font-semibold">
                    {{ getCategoryTag(item) }}
                  </span>
                </div>
              </div>

              <div *ngIf="order.notes" class="bg-yellow-100 border-l-4 border-yellow-500 p-2 mb-3 rounded text-xs text-yellow-900">
                <p class="font-semibold">📝 Notes:</p>
                <p class="italic">{{ order.notes }}</p>
              </div>

              <button 
                (click)="updateOrderStatus(order.publicId, 'PRETE')"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors">
                Marquer comme prêt
              </button>
            </div>
          </div>
        </div>

        <!-- Prêt à servir Column -->
        <div class="flex flex-col bg-green-50 rounded-lg border-2 border-green-300 overflow-hidden">
          <div class="bg-green-200 px-4 py-3 border-b-2 border-green-300">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-green-800 text-lg">✅ Prêt à servir</h2>
              <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
                {{ ordersbyStatus('PRETE').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-3">
            <div *ngFor="let order of ordersbyStatus('PRETE')" class="bg-white rounded-lg border-2 border-green-300 p-4 shadow-md hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{ order.table?.number || 'Takeaway' }}</h3>
                  <p class="text-sm text-gray-600">{{ order.table?.name }}</p>
                </div>
              </div>
              
              <div class="text-sm text-green-700 mb-3">
                <p class="font-semibold">Prêt depuis {{ getElapsedTime(order.createdAt) }}</p>
              </div>

              <div class="space-y-1 mb-3 text-sm">
                <div *ngFor="let item of order.items" class="flex justify-between">
                  <span class="text-gray-800">{{ item.quantity }}x {{ item.product?.name }}</span>
                  <span *ngIf="getCategoryTag(item)" [ngClass]="getCategoryClass(item)" class="px-2 py-1 rounded text-xs font-semibold">
                    {{ getCategoryTag(item) }}
                  </span>
                </div>
              </div>

              <div *ngIf="order.notes" class="bg-yellow-100 border-l-4 border-yellow-500 p-2 mb-3 rounded text-xs text-yellow-900">
                <p class="font-semibold">📝 Notes:</p>
                <p class="italic">{{ order.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KitchenKanbanComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  orders = signal<KitchenOrder[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadOrders();
    // Poll for new orders every 5 seconds
    setInterval(() => this.loadOrders(), 5000);
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.apiService.getOrdersByStatus('EN_ATTENTE').subscribe({
      next: (response) => {
        const enAttente = Array.isArray(response) ? response : response.content || [];
        
        this.apiService.getOrdersByStatus('EN_PREPARATION').subscribe({
          next: (response) => {
            const enPrep = Array.isArray(response) ? response : response.content || [];
            
            this.apiService.getOrdersByStatus('PRETE').subscribe({
              next: (response) => {
                const prete = Array.isArray(response) ? response : response.content || [];
                this.orders.set([...enAttente, ...enPrep, ...prete]);
                this.isLoading.set(false);
              },
              error: () => {
                this.orders.set([...enAttente, ...enPrep]);
                this.isLoading.set(false);
              }
            });
          },
          error: () => {
            this.orders.set(enAttente);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Erreur lors du chargement des commandes');
      }
    });
  }

  refreshOrders(): void {
    this.loadOrders();
    this.toast.info('Commandes rafraîchies', 2000);
  }

  ordersbyStatus(status: string): KitchenOrder[] {
    return this.orders().filter(o => o.status === status);
  }

  activeOrdersCount = computed(() => {
    return this.orders().filter(o => o.status !== 'LIVREE' && o.status !== 'PAYEE').length;
  });

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (response) => {
        this.toast.success(`Commande mise à jour: ${newStatus}`);
        this.loadOrders();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toast.error('Erreur lors de la mise à jour');
      }
    });
  }

  isUrgent(order: KitchenOrder): boolean {
    return order.notes?.toUpperCase().includes('URGENT') ?? false;
  }

  getElapsedTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (minutes === 0) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  }

  getCategoryTag(item: any): string {
    // Map category to tag - could be enhanced with actual category data
    const categoryId = item.product?.categoryId;
    if (!categoryId) return '';
    
    // Simple mapping - you can enhance this
    const categoryMap: { [key: string]: string } = {
      'appetizer': 'starter',
      'main': 'main',
      'dessert': 'dessert',
      'drink': 'drink'
    };
    
    return categoryMap[categoryId] || '';
  }

  getCategoryClass(item: any): string {
    const tag = this.getCategoryTag(item);
    const classMap: { [key: string]: string } = {
      'starter': 'bg-red-100 text-red-800',
      'main': 'bg-orange-100 text-orange-800',
      'dessert': 'bg-purple-100 text-purple-800',
      'drink': 'bg-blue-100 text-blue-800'
    };
    
    return classMap[tag] || 'bg-gray-100 text-gray-800';
  }
}
