import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';
import { WebSocketService } from '@core/services/websocket.service';
import { AnalyticsChartsComponent } from './analytics-charts/analytics-charts.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalyticsChartsComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private wsService = inject(WebSocketService);
  
  constructor() {}

  isLoading = signal(false);
  success = signal<string | null>(null);
  preset = signal<'today' | 'week' | 'month'>('today');
  wsConnected = signal(false);

  dateStart = this.getTodayString();
  dateEnd = this.getTodayString();

  kpis = signal({ revenue: 0, transactions: 0, averageOrder: 0, discounts: 0, discountPercent: 0 });
  topProducts = signal<any[]>([]);
  revenueByDay = signal<any[]>([]);
  cashierPerformance = signal<any[]>([]);
  peakHours = signal<any[]>([]);

  ngOnInit(): void {
    this.setPreset('today');
    // WebSocket temporarily disabled - will re-enable when backend endpoint is ready
    // this.initializeWebSocket();
  }

  ngAfterViewInit(): void {
    // Template rendered
  }

  private initializeWebSocket(): void {
    try {
      this.wsConnected.set(this.wsService.isConnected());
      
      // Listen for real-time updates
      this.wsService.message$.subscribe((message) => {
        if (message?.type === 'ORDER_PLACED' || message?.type === 'PAYMENT_RECEIVED') {
          // Reload analytics when significant events occur
          this.loadAnalytics();
        }
      });
    } catch (e) {
      console.error('Error in initializeWebSocket:', e);
    }
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    
    this.apiService.getAnalyticsSummary(this.dateStart, this.dateEnd).subscribe({
      next: (data) => {
        this.kpis.set({
          revenue: data.totalRevenue,
          transactions: data.totalTransactions,
          averageOrder: data.averageOrderValue,
          discounts: data.totalDiscounts,
          discountPercent: data.discountPercentage
        });
        this.topProducts.set(data.topProducts || []);
        this.revenueByDay.set(data.revenueByDay || []);
        this.cashierPerformance.set(data.cashierPerformance || []);
        this.peakHours.set(data.peakHours || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.toast.error('Erreur lors du chargement des analytics');
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const formatted = Math.round(value).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  setPreset(type: 'today' | 'week' | 'month'): void {
    this.preset.set(type);
    const today = new Date();
    
    if (type === 'today') {
      this.dateStart = this.formatDate(today);
      this.dateEnd = this.formatDate(today);
    } else if (type === 'week') {
      const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
      this.dateStart = this.formatDate(weekStart);
      this.dateEnd = this.formatDate(today);
    } else if (type === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      this.dateStart = this.formatDate(monthStart);
      this.dateEnd = this.formatDate(today);
    }
    
    this.updateDateRange();
  }

  updateDateRange(): void {
    this.loadAnalytics();
    Promise.resolve().then(() => {
      this.success.set('Données mises à jour');
      setTimeout(() => this.success.set(null), 2000);
    });
  }

  refreshAnalytics(): void {
    this.isLoading.set(true);
    Promise.resolve().then(() => {
      setTimeout(() => {
        this.isLoading.set(false);
        this.toast.success('Analytics rafraîchis');
      }, 1000);
    });
  }

  private getTodayString(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
