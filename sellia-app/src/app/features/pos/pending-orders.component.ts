import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../shared/services/currency.service';

@Component({
  selector: 'app-pending-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-orders.component.html',
  styleUrls: ['./pending-orders.component.css']
})
export class PendingOrdersComponent implements OnInit {
  private apiService = inject(ApiService);
  currencyService = inject(CurrencyService);

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
