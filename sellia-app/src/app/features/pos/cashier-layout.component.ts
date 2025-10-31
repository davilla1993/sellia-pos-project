import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AudioNotificationControlComponent } from '../../shared/components/audio-notification-control.component';
import { OrderNotificationService } from '../../core/services/order-notification.service';

@Component({
  selector: 'app-cashier-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
  templateUrl: './cashier-layout.component.html',
  styleUrls: ['./cashier-layout.component.css']
})
export class CashierLayoutComponent implements OnInit, OnDestroy {
  private orderNotificationService = inject(OrderNotificationService);

  ngOnInit(): void {
    // Start monitoring order changes for notifications
    this.orderNotificationService.startMonitoring();
  }

  ngOnDestroy(): void {
    this.orderNotificationService.stopMonitoring();
  }
}
