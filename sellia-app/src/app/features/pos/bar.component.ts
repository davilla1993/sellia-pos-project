import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { NavigationService } from '../../core/services/navigation.service';

interface BarOrder {
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
  isMixed?: boolean; // Indique si la commande contient des items CUISINE + BAR
}

@Component({
  selector: 'app-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-neutral-900 p-6 overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">🍹 Interface Bar</h1>
          <p class="text-neutral-400 text-sm">Gestion des commandes bar en temps réel</p>
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
                    <div class="ml-3 text-gray-600">
                      <div *ngFor="let product of getBarProducts(item)">• {{ product.name }}</div>
                    </div>
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
                [disabled]="order.isMixed"
                [class.opacity-50]="order.isMixed"
                [class.cursor-not-allowed]="order.isMixed"
                class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 text-xs rounded transition-colors">
                {{ order.isMixed ? 'Cuisine contrôle' : 'Commencer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Column 2: En préparation (EN_PREPARATION) -->
        <div class="flex flex-col bg-yellow-50 rounded-lg border-2 border-yellow-400 overflow-hidden">
          <div class="bg-yellow-300 px-4 py-3 border-b-2 border-yellow-400">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-yellow-900 text-sm">🍸 En préparation</h2>
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
                    <div class="ml-3 text-gray-600">
                      <div *ngFor="let product of getBarProducts(item)">• {{ product.name }}</div>
                    </div>
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
                [disabled]="order.isMixed"
                [class.opacity-50]="order.isMixed"
                [class.cursor-not-allowed]="order.isMixed"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 text-xs rounded transition-colors">
                {{ order.isMixed ? 'Cuisine contrôle' : 'Marquer prêt' }}
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
                    <div class="ml-3 text-gray-600">
                      <div *ngFor="let product of getBarProducts(item)">• {{ product.name }}</div>
                    </div>
                  </div>
                  <div *ngIf="!item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0">
                    {{ item.quantity }}x {{ item.product?.name }}
                  </div>
                </div>
              </div>
              <button
                (click)="updateOrderStatus(order.publicId, 'LIVREE')"
                [disabled]="order.isMixed"
                [class.opacity-50]="order.isMixed"
                [class.cursor-not-allowed]="order.isMixed"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 text-xs rounded transition-colors mt-2">
                {{ order.isMixed ? 'Cuisine contrôle' : 'Livrée' }}
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
                    <div class="ml-3 text-gray-600">
                      <div *ngFor="let product of getBarProducts(item)">• {{ product.name }}</div>
                    </div>
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

    </div>
  `,
  styles: []
})
export class BarComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  navigationService = inject(NavigationService);

  orders = signal<BarOrder[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadOrders();
    setInterval(() => this.loadOrders(), 5000);
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const statuses = ['ACCEPTEE', 'EN_PREPARATION', 'PRETE', 'LIVREE'];
    let loadedOrders: BarOrder[] = [];
    let completed = 0;

    statuses.forEach(status => {
      const pageSize = status === 'LIVREE' ? 100 : 10;
      this.apiService.getOrdersByStatus(status, 0, pageSize).subscribe({
        next: (response) => {
          const statusOrders = Array.isArray(response) ? response : response.content || [];

          // Filtrer pour ne garder que les commandes qui contiennent des items du Bar
          const barOrders = statusOrders.filter((order: BarOrder) => {
            if (!order.items || order.items.length === 0) return false;

            // Vérifier si au moins un item est du bar (direct ou via menuItem products)
            return order.items.some(item => {
              // Check direct workStation
              if (item.workStation && item.workStation === 'BAR') return true;

              // Check menuItem products
              if (item.menuItem && item.menuItem.products && item.menuItem.products.length > 0) {
                return item.menuItem.products.some((product: any) => product.workStation === 'BAR');
              }

              return false;
            });
          }).map((order: BarOrder) => {
            // Détecter si la commande est mixte (contient BAR + CUISINE)
            const hasBarItems = order.items.some(item => {
              if (item.workStation === 'BAR') return true;
              if (item.menuItem && item.menuItem.products) {
                return item.menuItem.products.some((p: any) => p.workStation === 'BAR');
              }
              return false;
            });

            const hasCuisineItems = order.items.some(item => {
              if (item.workStation === 'CUISINE') return true;
              if (item.menuItem && item.menuItem.products) {
                return item.menuItem.products.some((p: any) => p.workStation === 'CUISINE');
              }
              return false;
            });

            const isMixed = hasBarItems && hasCuisineItems;

            // Ne garder que les items du Bar dans chaque commande
            return {
              ...order,
              items: order.items.filter(item => {
                // Keep if direct workStation is BAR
                if (item.workStation && item.workStation === 'BAR') return true;

                // Keep if menuItem has BAR products
                if (item.menuItem && item.menuItem.products && item.menuItem.products.length > 0) {
                  return item.menuItem.products.some((p: any) => p.workStation === 'BAR');
                }

                return false;
              }),
              isMixed: isMixed
            };
          });

          loadedOrders = [...loadedOrders, ...barOrders];
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

  ordersbyStatus(status: string): BarOrder[] {
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

  getBarProducts(item: any): any[] {
    if (!item.menuItem || !item.menuItem.products || item.menuItem.products.length === 0) {
      return [];
    }
    // Filter only BAR products from the menu
    return item.menuItem.products.filter((p: any) => p.workStation === 'BAR');
  }

  isUrgent(order: BarOrder): boolean {
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
