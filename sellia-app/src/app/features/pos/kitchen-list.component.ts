import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-kitchen-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-neutral-900 p-6 overflow-hidden">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-white mb-2">👨‍🍳 Historique Commandes</h1>
        <p class="text-neutral-400">Vue complète des commandes de la journée</p>
      </div>

      <!-- Filters -->
      <div class="flex gap-4 mb-6">
        <div class="flex-1">
          <label class="text-white font-semibold mb-2 block text-sm">Filtrer par statut:</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              (click)="selectedStatus = ''"
              [class.bg-primary]="selectedStatus === ''"
              [class.bg-neutral-700]="selectedStatus !== ''"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-white text-sm">
              Tous
            </button>
            <button 
              (click)="selectedStatus = 'EN_ATTENTE'"
              [class.bg-red-600]="selectedStatus === 'EN_ATTENTE'"
              [class.bg-neutral-700]="selectedStatus !== 'EN_ATTENTE'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-white text-sm">
              ⏳ En attente
            </button>
            <button 
              (click)="selectedStatus = 'EN_PREPARATION'"
              [class.bg-yellow-600]="selectedStatus === 'EN_PREPARATION'"
              [class.bg-neutral-700]="selectedStatus !== 'EN_PREPARATION'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-white text-sm">
              👨‍🍳 En préparation
            </button>
            <button 
              (click)="selectedStatus = 'PRETE'"
              [class.bg-green-600]="selectedStatus === 'PRETE'"
              [class.bg-neutral-700]="selectedStatus !== 'PRETE'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-white text-sm">
              ✅ Prêt à servir
            </button>
            <button 
              (click)="selectedStatus = 'LIVREE'"
              [class.bg-blue-600]="selectedStatus === 'LIVREE'"
              [class.bg-neutral-700]="selectedStatus !== 'LIVREE'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-white text-sm">
              📦 Livrée
            </button>
          </div>
        </div>
        
        <div>
          <button 
            (click)="refreshOrders()"
            class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition-colors mt-7">
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="flex-1 overflow-auto">
        <table class="w-full border-collapse">
          <thead class="bg-neutral-800 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">Commande</th>
              <th class="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">Table</th>
              <th class="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">Items</th>
              <th class="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">Statut</th>
              <th class="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">Temps</th>
              <th class="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders()" class="bg-neutral-800 hover:bg-neutral-700 transition-colors border-b border-neutral-700">
              <!-- Order Number -->
              <td class="px-4 py-3 text-white font-semibold">
                {{ order.orderNumber }}
              </td>

              <!-- Table -->
              <td class="px-4 py-3">
                <span class="text-neutral-300">{{ order.table?.number || 'Takeaway' }}</span>
              </td>

              <!-- Items -->
              <td class="px-4 py-3">
                <div class="text-sm text-neutral-300 max-w-xs">
                  <div *ngFor="let item of order.items" class="truncate">
                    {{ item.quantity }}x {{ item.product?.name }}
                  </div>
                </div>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span [ngClass]="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>

              <!-- Time -->
              <td class="px-4 py-3">
                <span class="text-neutral-300 text-sm">{{ getElapsedTime(order.createdAt) }}</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button 
                    *ngIf="canChangeStatus(order.status, 'EN_PREPARATION')"
                    (click)="updateOrderStatus(order.publicId, 'EN_PREPARATION')"
                    class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-semibold transition-colors">
                    Préparer
                  </button>
                  <button 
                    *ngIf="canChangeStatus(order.status, 'PRETE')"
                    (click)="updateOrderStatus(order.publicId, 'PRETE')"
                    class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors">
                    Prêt
                  </button>
                  <button 
                    *ngIf="canChangeStatus(order.status, 'LIVREE')"
                    (click)="updateOrderStatus(order.publicId, 'LIVREE')"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors">
                    Livrer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredOrders().length === 0" class="flex items-center justify-center h-32 text-neutral-400">
          <p>Aucune commande trouvée</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KitchenListComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  orders = signal<KitchenOrder[]>([]);
  selectedStatus = '';
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading.set(true);
    const statuses = ['EN_ATTENTE', 'EN_PREPARATION', 'PRETE', 'LIVREE'];
    let loadedOrders: KitchenOrder[] = [];
    let completed = 0;

    statuses.forEach(status => {
      this.apiService.getOrdersByStatus(status).subscribe({
        next: (response) => {
          const statusOrders = Array.isArray(response) ? response : response.content || [];
          loadedOrders = [...loadedOrders, ...statusOrders];
          completed++;
          
          if (completed === statuses.length) {
            // Sort by creation date (newest first)
            loadedOrders.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
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
    this.loadAllOrders();
    this.toast.info('Commandes rafraîchies', 2000);
  }

  filteredOrders(): KitchenOrder[] {
    if (!this.selectedStatus) {
      return this.orders();
    }
    return this.orders().filter(o => o.status === this.selectedStatus);
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.toast.success(`Commande: ${newStatus}`);
        this.loadAllOrders();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toast.error('Erreur lors de la mise à jour');
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': '⏳ En attente',
      'EN_PREPARATION': '👨‍🍳 En préparation',
      'PRETE': '✅ Prêt',
      'LIVREE': '📦 Livrée',
      'PAYEE': '✓ Payée',
      'ANNULEE': '✗ Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'EN_ATTENTE': 'bg-red-900 text-red-100',
      'EN_PREPARATION': 'bg-yellow-900 text-yellow-100',
      'PRETE': 'bg-green-900 text-green-100',
      'LIVREE': 'bg-blue-900 text-blue-100',
      'PAYEE': 'bg-purple-900 text-purple-100',
      'ANNULEE': 'bg-gray-900 text-gray-100'
    };
    return classMap[status] || 'bg-neutral-700 text-neutral-100';
  }

  canChangeStatus(currentStatus: string, targetStatus: string): boolean {
    // Define valid transitions
    const validTransitions: { [key: string]: string[] } = {
      'EN_ATTENTE': ['EN_PREPARATION'],
      'EN_PREPARATION': ['PRETE'],
      'PRETE': ['LIVREE'],
      'LIVREE': []
    };

    return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
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
