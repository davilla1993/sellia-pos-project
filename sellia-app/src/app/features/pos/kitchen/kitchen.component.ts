import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';
import { NavigationService } from '@core/services/navigation.service';
import { CancelOrderDialogComponent } from '../cancel-order-dialog/cancel-order-dialog.component';

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
  templateUrl: './kitchen.component.html',
  styleUrls: ['./kitchen.component.css']
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
