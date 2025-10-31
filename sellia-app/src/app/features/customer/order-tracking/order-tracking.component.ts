import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { WebSocketService } from '@core/services/websocket.service';
import { Order } from '@shared/models/types';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit {
  order = signal<Order | null>(null);
  notification = signal<string | null>(null);

  orderStatuses = [
    { value: 'EN_ATTENTE', label: 'Order Received', description: 'Your order has been placed' },
    { value: 'ACCEPTEE', label: 'Confirmed', description: 'Kitchen has accepted your order' },
    { value: 'EN_PREPARATION', label: 'Preparing', description: 'Your meal is being prepared' },
    { value: 'PRETE', label: 'Ready', description: 'Your order is ready to be served' },
    { value: 'LIVREE', label: 'Delivered', description: 'Your meal has been delivered' },
    { value: 'PAYEE', label: 'Completed', description: 'Order paid and completed' }
  ];

  constructor(
    private apiService: ApiService,
    private wsService: WebSocketService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
      this.subscribeToUpdates(orderId);
    }
  }

  loadOrder(orderId: string): void {
    this.apiService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
      },
      error: (err) => {
        console.error('Failed to load order:', err);
      }
    });
  }

  subscribeToUpdates(orderId: string): void {
    this.wsService.message$.subscribe((message: any) => {
      if (message?.type === 'ORDER_PLACED' || message?.type === 'ORDER_COMPLETED') {
        const update = message.data;
        if (update?.orderId === orderId) {
          const currentOrder = this.order();
          if (currentOrder) {
            currentOrder.status = update.status;
            this.order.set({ ...currentOrder });
            this.showNotification(`Order status updated: ${update.status}`);
          }
        }
      }
    });
  }

  isStatusCompleted(status: string): boolean {
    const currentStatus = this.order()?.status || 'EN_ATTENTE';
    return this.orderStatuses.findIndex(s => s.value === status) <=
           this.orderStatuses.findIndex(s => s.value === currentStatus);
  }

  isStatusCurrent(status: string): boolean {
    return this.order()?.status === status;
  }

  getStatusClass(status: string): string {
    if (this.isStatusCurrent(status)) {
      return 'animate-pulse';
    }
    return '';
  }

  showNotification(message: string): void {
    this.notification.set(message);
    setTimeout(() => this.notification.set(null), 3000);
  }

  formatItemTotal(price: number, quantity: number): string {
    const total = price * quantity;
    const amountInFcfa = Math.round(total / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }

  formatTotalPrice(totalAmount: number): string {
    const amountInFcfa = Math.round(totalAmount / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }
}
