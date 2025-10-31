import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Order } from '@shared/models/types';

@Component({
  selector: 'app-order-tracking-simple',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <div class="section-header">
        <h1 class="section-title">Order Tracking</h1>
      </div>

      <div *ngIf="order() as o" class="card">
        <h2 class="text-2xl font-bold text-dark mb-4">Order #{{ o.orderNumber }}</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Status</span>
            <span class="font-semibold">{{ o.status }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total</span>
            <span class="text-primary font-bold">{{ getTotal(o) }}</span>
          </div>
        </div>
        <button routerLink="/customer/menu" class="btn-primary w-full mt-6">Back to Menu</button>
      </div>
    </div>
  `
})
export class OrderTrackingSimpleComponent implements OnInit {
  order = signal<Order | null>(null);

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.apiService.getOrder(orderId).subscribe(order => this.order.set(order));
    }
  }

  getTotal(order: Order): string {
    const amountInFcfa = Math.round(order.totalAmount / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }
}
