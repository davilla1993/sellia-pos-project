import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, interval, takeUntil } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { AudioNotificationService } from './audio-notification.service';

interface OrderStatusChange {
  orderId: string;
  status: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderNotificationService {
  private apiService = inject(ApiService);
  private audioService = inject(AudioNotificationService);

  private destroy$ = new Subject<void>();
  private lastSeenOrders = new Map<string, string>();
  
  private orderStatusChanged$ = new BehaviorSubject<OrderStatusChange | null>(null);
  orderStatusChanged = this.orderStatusChanged$.asObservable();

  startMonitoring(): void {
    // Poll every 10 seconds for order changes
    interval(10000)
      .pipe(
        switchMap(() => this.apiService.getActiveOrders()),
        tap((orders) => this.checkForChanges(orders)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  stopMonitoring(): void {
    this.destroy$.next();
  }

  private checkForChanges(orders: any[]): void {
    for (const order of orders) {
      const previousStatus = this.lastSeenOrders.get(order.publicId);
      
      // New order detected
      if (!previousStatus) {
        this.lastSeenOrders.set(order.publicId, order.status);
        this.audioService.playNewOrder();
        this.orderStatusChanged$.next({
          orderId: order.publicId,
          status: 'NEW',
          timestamp: new Date()
        });
      }
      // Status changed
      else if (previousStatus !== order.status) {
        this.lastSeenOrders.set(order.publicId, order.status);
        
        // Play sound if order is ready
        if (order.status === 'PRETE') {
          this.audioService.playOrderReady();
        }
        
        this.orderStatusChanged$.next({
          orderId: order.publicId,
          status: order.status,
          timestamp: new Date()
        });
      }
    }

    // Clean up removed orders
    const orderIds = new Set(orders.map(o => o.publicId));
    for (const seenId of this.lastSeenOrders.keys()) {
      if (!orderIds.has(seenId)) {
        this.lastSeenOrders.delete(seenId);
      }
    }
  }

  clearTracking(): void {
    this.lastSeenOrders.clear();
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
