import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { NavigationService } from '../../core/services/navigation.service';
import { CancelOrderDialogComponent } from './cancel-order-dialog.component';

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
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule, CancelOrderDialogComponent],
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

      <!-- Kanban Board - 4 Columns -->
      <div class="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
        
        <!-- Column 1: Nouvelles commandes (ACCEPTEE) -->
        <div class="flex flex-col bg-orange-50 rounded-lg border-2 border-orange-400 overflow-hidden">
          <div class="bg-orange-300 px-4 py-3 border-b-2 border-orange-400">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-orange-900 text-sm">📨 Nouvelles commandes</h2>
              <span class="bg-orange-600 text-white rounded-full px-2 py-1 font-bold text-xs">
                {{ ordersbyStatus('ACCEPTEE').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <div *ngFor="let order of ordersbyStatus('ACCEPTEE')" class="bg-white rounded-lg border-2 border-orange-300 p-3 shadow-md hover:shadow-lg transition-shadow">
              <h3 class="font-bold text-gray-900 text-sm mb-1">{{ order.table?.number || 'Takeaway' }}</h3>
              <p class="text-xs text-gray-600 mb-2">{{ getElapsedTime(order.createdAt) }}</p>
              <div class="text-xs space-y-1 mb-2">
                <div *ngFor="let item of order.items">
                  <div *ngIf="item.menuItem && item.menuItem.products && item.menuItem.products.length > 0" class="mb-1">
                    <strong>{{ item.quantity }}x {{ item.menuItem.menuName }}</strong>
                    <button
                      (click)="openComboModal(item)"
                      class="ml-2 text-blue-600 hover:text-blue-800 underline text-xs">
                      ({{ getKitchenProducts(item).length }} produits)
                    </button>
                  </div>
                  <div *ngIf="!item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0">
                    {{ item.quantity }}x {{ item.product?.name }}
                  </div>
                </div>
              </div>
              <div *ngIf="order.notes" class="bg-red-100 border-l-4 border-red-500 p-2 mb-2 rounded">
                <p class="text-xs font-semibold text-red-900 mb-1">📝 Notes spéciales:</p>
                <p class="text-xs text-red-800">{{ order.notes }}</p>
              </div>
              <button 
                (click)="updateOrderStatus(order.publicId, 'EN_PREPARATION')"
                class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 text-xs rounded transition-colors mb-1">
                Commencer
              </button>
              <button 
                *ngIf="!navigationService.isCuisine()"
                (click)="showCancelDialog(order)"
                class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-1 text-xs rounded transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- Column 2: En préparation (EN_PREPARATION) -->
        <div class="flex flex-col bg-yellow-50 rounded-lg border-2 border-yellow-400 overflow-hidden">
          <div class="bg-yellow-300 px-4 py-3 border-b-2 border-yellow-400">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-yellow-900 text-sm">👨‍🍳 En préparation</h2>
              <span class="bg-yellow-600 text-white rounded-full px-2 py-1 font-bold text-xs">
                {{ ordersbyStatus('EN_PREPARATION').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <div *ngFor="let order of ordersbyStatus('EN_PREPARATION')" class="bg-white rounded-lg border-2 border-yellow-300 p-3 shadow-md hover:shadow-lg transition-shadow">
              <h3 class="font-bold text-gray-900 text-sm mb-1">{{ order.table?.number || 'Takeaway' }}</h3>
              <p class="text-xs text-gray-600 mb-2">{{ getElapsedTime(order.createdAt) }}</p>
              <div class="text-xs space-y-1 mb-2">
                <div *ngFor="let item of order.items">
                  <div *ngIf="item.menuItem && item.menuItem.products && item.menuItem.products.length > 0" class="mb-1">
                    <strong>{{ item.quantity }}x {{ item.menuItem.menuName }}</strong>
                    <button
                      (click)="openComboModal(item)"
                      class="ml-2 text-blue-600 hover:text-blue-800 underline text-xs">
                      ({{ getKitchenProducts(item).length }} produits)
                    </button>
                  </div>
                  <div *ngIf="!item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0">
                    {{ item.quantity }}x {{ item.product?.name }}
                  </div>
                </div>
              </div>
              <div *ngIf="order.notes" class="bg-red-100 border-l-4 border-red-500 p-2 mb-2 rounded">
                <p class="text-xs font-semibold text-red-900 mb-1">📝 Notes spéciales:</p>
                <p class="text-xs text-red-800">{{ order.notes }}</p>
              </div>
              <button 
                (click)="updateOrderStatus(order.publicId, 'PRETE')"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 text-xs rounded transition-colors">
                Marquer prêt
              </button>
            </div>
          </div>
        </div>

        <!-- Column 3: Prête (PRETE) -->
        <div class="flex flex-col bg-green-50 rounded-lg border-2 border-green-400 overflow-hidden">
          <div class="bg-green-300 px-4 py-3 border-b-2 border-green-400">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-green-900 text-sm">✅ Prête</h2>
              <span class="bg-green-600 text-white rounded-full px-2 py-1 font-bold text-xs">
                {{ ordersbyStatus('PRETE').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <div *ngFor="let order of ordersbyStatus('PRETE')" class="bg-white rounded-lg border-2 border-green-300 p-3 shadow-md">
              <h3 class="font-bold text-gray-900 text-sm mb-1">{{ order.table?.number || 'Takeaway' }}</h3>
              <p class="text-xs text-gray-600 mb-2">Prête depuis {{ getElapsedTime(order.createdAt) }}</p>
              <div *ngIf="order.notes" class="bg-red-100 border-l-4 border-red-500 p-2 mb-2 rounded">
                <p class="text-xs font-semibold text-red-900 mb-1">📝 Notes spéciales:</p>
                <p class="text-xs text-red-800">{{ order.notes }}</p>
              </div>
              <div class="text-xs space-y-1">
                <div *ngFor="let item of order.items">
                  <div *ngIf="item.menuItem && item.menuItem.products && item.menuItem.products.length > 0" class="mb-1">
                    <strong>{{ item.quantity }}x {{ item.menuItem.menuName }}</strong>
                    <button
                      (click)="openComboModal(item)"
                      class="ml-2 text-blue-600 hover:text-blue-800 underline text-xs">
                      ({{ getKitchenProducts(item).length }} produits)
                    </button>
                  </div>
                  <div *ngIf="!item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0">
                    {{ item.quantity }}x {{ item.product?.name }}
                  </div>
                </div>
              </div>
              <button 
                (click)="updateOrderStatus(order.publicId, 'LIVREE')"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 text-xs rounded transition-colors mt-2">
                Livrée
              </button>
            </div>
          </div>
        </div>

        <!-- Column 4: Livrée (LIVREE) -->
        <div class="flex flex-col bg-blue-50 rounded-lg border-2 border-blue-400 overflow-hidden">
          <div class="bg-blue-300 px-4 py-3 border-b-2 border-blue-400">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-blue-900 text-sm">🚚 Livrée</h2>
              <span class="bg-blue-600 text-white rounded-full px-2 py-1 font-bold text-xs">
                {{ ordersbyStatus('LIVREE').length }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <div *ngFor="let order of ordersbyStatus('LIVREE')" class="bg-white rounded-lg border-2 border-blue-300 p-3 shadow-md">
              <h3 class="font-bold text-gray-900 text-sm mb-1">{{ order.table?.number || 'Takeaway' }}</h3>
              <p class="text-xs text-gray-600 mb-2">Livrée il y a {{ getElapsedTime(order.createdAt) }}</p>
              <div *ngIf="order.notes" class="bg-red-100 border-l-4 border-red-500 p-2 mb-2 rounded">
                <p class="text-xs font-semibold text-red-900 mb-1">📝 Notes spéciales:</p>
                <p class="text-xs text-red-800">{{ order.notes }}</p>
              </div>
              <div class="text-xs space-y-1">
                <div *ngFor="let item of order.items">
                  <div *ngIf="item.menuItem && item.menuItem.products && item.menuItem.products.length > 0" class="mb-1">
                    <strong>{{ item.quantity }}x {{ item.menuItem.menuName }}</strong>
                    <button
                      (click)="openComboModal(item)"
                      class="ml-2 text-blue-600 hover:text-blue-800 underline text-xs">
                      ({{ getKitchenProducts(item).length }} produits)
                    </button>
                  </div>
                  <div *ngIf="!item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0">
                    {{ item.quantity }}x {{ item.product?.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Dialog -->
      <app-cancel-order-dialog
        *ngIf="showCancelDialogFlag()"
        [orderNumber]="orderToCancel()?.orderNumber || ''"
        (onConfirmClick)="confirmCancelOrder($event)"
        (onCancelClick)="hideCancelDialog()">
      </app-cancel-order-dialog>

      <!-- Combo Details Modal -->
      <div *ngIf="showComboModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeComboModal()">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Détails du combo - Cuisine</h3>
            <button (click)="closeComboModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <div class="space-y-3">
            <div *ngFor="let product of getKitchenProducts(selectedComboItem())" class="flex items-center p-3 bg-gray-50 rounded">
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ product.name }}</p>
                <p class="text-xs text-gray-600">Station: {{ product.workStation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KitchenComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  navigationService = inject(NavigationService);

  orders = signal<KitchenOrder[]>([]);
  isLoading = signal(false);
  showCancelDialogFlag = signal(false);
  orderToCancel = signal<KitchenOrder | null>(null);

  // Modal pour afficher les détails des combos
  showComboModal = signal(false);
  selectedComboItem = signal<any>(null);

  ngOnInit(): void {
    this.loadOrders();
    setInterval(() => this.loadOrders(), 5000);
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const statuses = ['ACCEPTEE', 'EN_PREPARATION', 'PRETE', 'LIVREE'];
    let loadedOrders: KitchenOrder[] = [];
    let completed = 0;

    statuses.forEach(status => {
      // Load more items for LIVREE status to keep history visible
      const pageSize = status === 'LIVREE' ? 100 : 10;
      this.apiService.getOrdersByStatus(status, 0, pageSize).subscribe({
        next: (response) => {
          const statusOrders = Array.isArray(response) ? response : response.content || [];

          // Filtrer pour ne garder que les commandes qui contiennent des items de la CUISINE
          const kitchenOrders = statusOrders.filter((order: KitchenOrder) => {
            if (!order.items || order.items.length === 0) return false;

            // Vérifier si au moins un item est de la cuisine (direct ou via menuItem products)
            return order.items.some(item => {
              // Check direct workStation
              if (item.workStation && item.workStation === 'CUISINE') return true;

              // Check menuItem products
              if (item.menuItem && item.menuItem.products && item.menuItem.products.length > 0) {
                return item.menuItem.products.some((product: any) => product.workStation === 'CUISINE');
              }

              return false;
            });
          }).map((order: KitchenOrder) => {
            // Ne garder que les items de la CUISINE dans chaque commande
            return {
              ...order,
              items: order.items.filter(item => {
                // Keep if direct workStation is CUISINE
                if (item.workStation && item.workStation === 'CUISINE') return true;

                // Keep if menuItem has CUISINE products
                if (item.menuItem && item.menuItem.products && item.menuItem.products.length > 0) {
                  return item.menuItem.products.some((p: any) => p.workStation === 'CUISINE');
                }

                return false;
              })
            };
          });

          loadedOrders = [...loadedOrders, ...kitchenOrders];
          completed++;

          if (completed === statuses.length) {
            this.orders.set(loadedOrders);
            this.isLoading.set(false);
          }
        },
        error: () => {
          completed++;
          if (completed === statuses.length) {
            this.isLoading.set(false);
          }
        }
      });
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
    return this.orders().filter(o => !['LIVREE', 'PAYEE', 'ANNULEE'].includes(o.status)).length;
  });

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.toast.success(`✓ ${newStatus}`);
        this.loadOrders();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toast.error('Erreur lors de la mise à jour');
      }
    });
  }

  getKitchenProducts(item: any): any[] {
    if (!item || !item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0) {
      return [];
    }
    // Filter only CUISINE products from the menu
    return item.menuItem.products.filter((p: any) => p.workStation === 'CUISINE');
  }

  openComboModal(item: any): void {
    this.selectedComboItem.set(item);
    this.showComboModal.set(true);
  }

  closeComboModal(): void {
    this.showComboModal.set(false);
    this.selectedComboItem.set(null);
  }

  showCancelDialog(order: KitchenOrder): void {
    // Can only cancel EN_ATTENTE and ACCEPTEE orders
    if (!['EN_ATTENTE', 'ACCEPTEE'].includes(order.status)) {
      this.toast.warning('Impossible d\'annuler une commande en préparation');
      return;
    }
    this.orderToCancel.set(order);
    this.showCancelDialogFlag.set(true);
  }

  hideCancelDialog(): void {
    this.showCancelDialogFlag.set(false);
    this.orderToCancel.set(null);
  }

  confirmCancelOrder(reason: string): void {
    const order = this.orderToCancel();
    if (!order) return;

    this.apiService.updateOrderStatus(order.publicId, 'ANNULEE').subscribe({
      next: () => {
        this.toast.success('✓ Commande annulée');
        this.hideCancelDialog();
        this.loadOrders();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toast.error('Erreur lors de l\'annulation');
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
}
