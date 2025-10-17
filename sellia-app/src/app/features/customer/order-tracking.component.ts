import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { Order } from '../../shared/models/types';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="section-header">
        <h1 class="section-title">Order Tracking</h1>
        <p class="section-subtitle">Order #{{ order()?.orderNumber }}</p>
      </div>

      <!-- Order Status Timeline -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="card">
          <div class="relative">
            <div class="space-y-8">
              <div
                *ngFor="let status of orderStatuses; let last = last"
                [ngClass]="getStatusClass(status.value)"
                class="flex items-start"
              >
                <div class="flex flex-col items-center mr-6">
                  <div
                    class="w-4 h-4 rounded-full"
                    [class.bg-primary]="isStatusCompleted(status.value)"
                    [class.bg-neutral-300]="!isStatusCompleted(status.value)"
                  ></div>
                  <div
                    *ngIf="!last"
                    class="w-1 h-12"
                    [class.bg-primary]="isStatusCompleted(status.value)"
                    [class.bg-neutral-300]="!isStatusCompleted(status.value)"
                  ></div>
                </div>

                <div class="pt-1">
                  <h3
                    class="font-semibold"
                    [class.text-primary]="isStatusCurrent(status.value)"
                    [class.text-dark]="!isStatusCurrent(status.value)"
                  >
                    {{ status.label }}
                  </h3>
                  <p class="text-sm text-neutral-600">{{ status.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="card">
            <h2 class="text-2xl font-bold text-dark mb-6">Order Items</h2>
            <div class="space-y-4">
              <div
                *ngFor="let item of order()?.items || []"
                class="flex justify-between items-center pb-4 border-b border-neutral-200"
              >
                <div>
                  <h3 class="font-semibold text-dark">{{ item.productId }}</h3>
                  <p class="text-sm text-neutral-600">Qty: {{ item.quantity }}</p>
                </div>
                <span class="text-primary font-bold">{{ formatItemTotal(item.price, item.quantity) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div>
          <div class="card sticky top-24">
            <h3 class="text-xl font-bold text-dark mb-4">Summary</h3>

            <div class="space-y-2 pb-4 border-b border-neutral-200">
              <div class="flex justify-between text-neutral-700">
                <span>Status</span>
                <span
                  class="font-semibold px-3 py-1 rounded-full text-sm"
                  [class.bg-yellow-100]="order()?.status === 'EN_ATTENTE'"
                  [class.text-yellow-800]="order()?.status === 'EN_ATTENTE'"
                  [class.bg-blue-100]="order()?.status === 'EN_PREPARATION'"
                  [class.text-blue-800]="order()?.status === 'EN_PREPARATION'"
                  [class.bg-green-100]="order()?.status === 'PRETE'"
                  [class.text-green-800]="order()?.status === 'PRETE'"
                >
                  {{ order()?.status }}
                </span>
              </div>
              <div class="flex justify-between text-neutral-700">
                <span>Order Time</span>
                <span>{{ order()?.createdAt | date:'short' }}</span>
              </div>
              <div class="flex justify-between text-neutral-700">
                <span>Payment</span>
                <span>{{ order()?.paymentMethod }}</span>
              </div>
            </div>

            <div class="flex justify-between text-xl font-bold text-dark mb-6 pt-4">
              <span>Total</span>
              <span class="text-primary">{{ formatTotalPrice(order()?.totalAmount || 0) }}</span>
            </div>

            <button
              routerLink="/customer/menu"
              class="btn-primary w-full"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div *ngIf="notification()" class="fixed bottom-6 right-6 bg-green-500 text-white rounded-lg shadow-elevation p-4 animate-slide-up">
        <p class="font-semibold">{{ notification() }}</p>
      </div>
    </div>
  `,
  styles: []
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
    this.wsService.orderUpdates$.subscribe((update) => {
      if (update.orderId === orderId) {
        const currentOrder = this.order();
        if (currentOrder) {
          currentOrder.status = update.status;
          this.order.set({ ...currentOrder });
          this.showNotification(`Order status updated: ${update.status}`);
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
    return '$' + (price * quantity).toFixed(2);
  }

  formatTotalPrice(totalAmount: number): string {
    return '$' + totalAmount.toFixed(2);
  }
}
