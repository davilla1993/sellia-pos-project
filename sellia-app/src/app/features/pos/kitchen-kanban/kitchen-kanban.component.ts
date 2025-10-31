import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';

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
  templateUrl: './kitchen-kanban.component.html',
  styleUrls: ['./kitchen-kanban.component.css']
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
