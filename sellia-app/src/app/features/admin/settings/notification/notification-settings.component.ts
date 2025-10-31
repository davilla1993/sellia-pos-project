import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WritableSignal } from '@angular/core';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent {
  closeSignal = input<WritableSignal<boolean>>();

  notifications = {
    lowStock: true,
    unpaidOrders: true,
    newOrders: true,
    smsCriticalStock: false,
    smsLargeOrders: false,
    email: '',
    phone: ''
  };

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  save(): void {
    console.log('Notification settings saved:', this.notifications);
    this.closeModal();
  }
}
