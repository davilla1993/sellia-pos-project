import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AudioNotificationControlComponent } from '../../shared/components/audio-notification-control.component';
import { OrderNotificationService } from '../../core/services/order-notification.service';

@Component({
  selector: 'app-kitchen-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
  template: `
    <div class="h-full w-full flex flex-col bg-neutral-900 overflow-hidden">
      <!-- Header with Notifications Control -->
      <div class="bg-neutral-800 border-b border-neutral-700 p-4 flex justify-between items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">👨‍🍳 Cuisine</h1>
          <p class="text-xs text-neutral-400">Interface de cuisson avec notifications</p>
        </div>
        <app-audio-notification-control></app-audio-notification-control>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class KitchenLayoutComponent implements OnInit, OnDestroy {
  private orderNotificationService = inject(OrderNotificationService);

  ngOnInit(): void {
    // Start monitoring order changes for notifications
    this.orderNotificationService.startMonitoring();
  }

  ngOnDestroy(): void {
    this.orderNotificationService.stopMonitoring();
  }
}
