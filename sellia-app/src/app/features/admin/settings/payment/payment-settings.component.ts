import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WritableSignal } from '@angular/core';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.css']
})
export class PaymentSettingsComponent {
  closeSignal = input<WritableSignal<boolean>>();

  paymentMethods = {
    cash: true,
    card: false,
    check: false,
    mobileMoney: false,
    credit: false
  };

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  save(): void {
    console.log('Payment methods saved:', this.paymentMethods);
    this.closeModal();
  }
}
