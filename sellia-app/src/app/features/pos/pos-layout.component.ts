import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '../../core/services/navigation.service';
import { ApiService } from '../../core/services/api.service';
import { OrderNotificationService } from '../../core/services/order-notification.service';
import { AudioNotificationControlComponent } from '../../shared/components/audio-notification-control.component';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
  templateUrl: './pos-layout.component.html',
  styleUrls: ['./pos-layout.component.css']
})
export class PosLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private orderNotificationService = inject(OrderNotificationService);
  navigationService = inject(NavigationService);

  currentRoute = signal('');
  pendingOrdersCount = signal(0);

  constructor() {
    effect(() => {
      if (this.currentRoute() && this.currentRoute().includes('/pos')) {
        this.loadPendingOrdersCount();
      }
    });
  }

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);
    this.loadPendingOrdersCount();
    setInterval(() => this.loadPendingOrdersCount(), 5000);
    
    // Start monitoring order changes for notifications
    this.orderNotificationService.startMonitoring();
  }

  ngOnDestroy(): void {
    this.orderNotificationService.stopMonitoring();
  }

  loadPendingOrdersCount(): void {
    this.apiService.getOrdersByStatus('EN_ATTENTE').subscribe({
      next: (response: any) => {
        const data = response?.content || response?.data || response || [];
        const count = Array.isArray(data) ? data.length : 0;
        this.pendingOrdersCount.set(count);
      },
      error: () => {
        this.pendingOrdersCount.set(0);
      }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.currentRoute.set(route);
  }

  isActive(route: string): boolean {
    const currentRoute = this.currentRoute();
    // Exact match or match with trailing slash
    return currentRoute === route || currentRoute === route + '/';
  }

  isInKitchenContext(): boolean {
    const route = this.currentRoute();
    return route.includes('/pos/kitchen');
  }

  isInBarContext(): boolean {
    const route = this.currentRoute();
    return route.includes('/pos/bar');
  }

  getCurrentUserInfo(): string {
    return `${this.navigationService.getCurrentUserName()} • ${this.navigationService.getCurrentUserRole()}`;
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
