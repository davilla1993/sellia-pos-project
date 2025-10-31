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
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  navigationService = inject(NavigationService);

  orders = signal<BarOrder[]>([]);
  isLoading = signal(false);
  showComboModal = signal(false);
  selectedComboItem = signal<any>(null);

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

  openComboModal(item: any): void {
    this.selectedComboItem.set(item);
    this.showComboModal.set(true);
  }

  closeComboModal(): void {
    this.showComboModal.set(false);
    this.selectedComboItem.set(null);
  }
}
