import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-checkout-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="section-header">
        <h1 class="section-title">Order Summary</h1>
      </div>

      <div class="card sticky top-24">
        <h3 class="text-xl font-bold text-dark mb-4">Summary</h3>
        <div class="space-y-3 pb-4 border-b border-neutral-200">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{{ subtotal() }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax</span>
            <span>{{ tax() }}</span>
          </div>
        </div>
        <div class="flex justify-between text-xl font-bold text-dark pt-4 mb-6">
          <span>Total</span>
          <span class="text-primary">{{ total() }}</span>
        </div>
        <button (click)="placeOrder()" class="btn-primary w-full" [disabled]="isProcessing()">
          {{ isProcessing() ? 'Processing...' : 'Place Order' }}
        </button>
      </div>
    </div>
  `
})
export class CheckoutSimpleComponent {
  isProcessing = signal(false);
  subtotal = () => '$0.00';
  tax = () => '$0.00';
  total = () => '$0.00';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  placeOrder(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.router.navigate(['/customer/menu']);
    }, 1000);
  }
}
