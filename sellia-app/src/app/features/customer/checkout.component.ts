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
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
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
