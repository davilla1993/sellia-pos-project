import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-checkout-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-simple.component.html',
  styleUrl: './checkout-simple.component.css'
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
