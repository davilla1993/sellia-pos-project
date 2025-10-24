import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../shared/models/types';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="section-header">
        <h1 class="section-title">Order Summary</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Order Items (Left) -->
        <div class="lg:col-span-2">
          <div class="card">
            <h2 class="text-2xl font-bold text-dark mb-6">Order Details</h2>

            <div class="space-y-4">
              <div *ngFor="let item of orderItems()" class="flex justify-between items-center pb-4 border-b border-neutral-200">
                <div>
                  <h3 class="font-semibold text-dark">{{ item.name }}</h3>
                  <p class="text-sm text-neutral-600">Qty: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-primary">{{ formatItemTotal(item.price, item.quantity) }}</p>
                </div>
              </div>
            </div>

            <!-- Additional Notes -->
            <div class="mt-6">
              <label class="block text-sm font-semibold text-dark mb-2">Special Requests (Optional)</label>
              <textarea
                [(ngModel)]="notes"
                class="input-field"
                rows="3"
                placeholder="Any special requests or allergies?"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Summary (Right Sidebar) -->
        <div>
          <div class="card sticky top-24">
            <h3 class="text-xl font-bold text-dark mb-4">Summary</h3>

            <div class="space-y-3 pb-4 border-b border-neutral-200">
              <div class="flex justify-between text-neutral-700">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal()) }}</span>
              </div>
              <div class="flex justify-between text-neutral-700">
                <span>Tax (10%)</span>
                <span>{{ formatPrice(tax()) }}</span>
              </div>
              <div *ngIf="discount() > 0" class="flex justify-between text-green-600">
                <span>Discount</span>
                <span>{{ '-' + formatPrice(discount()) }}</span>
              </div>
            </div>

            <div class="flex justify-between text-xl font-bold text-dark mb-6 pt-4">
              <span>Total</span>
              <span class="text-primary">{{ formatPrice(total()) }}</span>
            </div>

            <!-- Payment Method -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-dark mb-2">Payment Method</label>
              <select [(ngModel)]="paymentMethod" class="input-field">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="MOBILE">Mobile Money</option>
              </select>
            </div>

            <!-- Place Order Button -->
            <button
              (click)="placeOrder()"
              [disabled]="isProcessing()"
              class="btn-primary w-full"
              [class.opacity-50]="isProcessing()"
            >
              {{ isProcessing() ? 'Processing...' : 'Place Order' }}
            </button>

            <button
              (click)="continueShopping()"
              class="btn-secondary w-full mt-3"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CheckoutComponent implements OnInit {
  orderItems = signal<any[]>([]);
  notes = '';
  paymentMethod = 'CASH';
  isProcessing = signal(false);

  subtotal = signal(0);
  tax = signal(0);
  discount = signal(0);
  total = signal(0);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.calculateTotals();
  }

  calculateTotals(): void {
    const sub = this.orderItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = sub * 0.1;
    const total = sub + taxAmount - this.discount();

    this.subtotal.set(sub);
    this.tax.set(taxAmount);
    this.total.set(total);
  }

  placeOrder(): void {
    this.isProcessing.set(true);

    const order: Order = {
      items: this.orderItems().map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: this.total(),
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      status: 'EN_ATTENTE'
    };

    this.apiService.createOrder(order).subscribe({
      next: (createdOrder) => {
        this.isProcessing.set(false);
        this.router.navigate(['/customer/order-tracking', createdOrder.id]);
      },
      error: (err) => {
        this.isProcessing.set(false);
        console.error('Failed to place order:', err);
        alert('Failed to place order. Please try again.');
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/customer/menu']);
  }

  formatItemTotal(price: number, quantity: number): string {
    const total = price * quantity;
    const amountInFcfa = Math.round(total / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }

  formatPrice(value: number): string {
    const amountInFcfa = Math.round(value / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }
}
