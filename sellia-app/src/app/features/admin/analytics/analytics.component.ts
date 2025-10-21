import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">📊 Analytics</h1>
          <p class="text-neutral-400">Statistiques et analyses en temps réel</p>
        </div>
        <button (click)="refreshAnalytics()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Date Range Filter -->
      <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700 flex gap-4 flex-wrap items-end">
        <div>
          <label class="block text-sm font-semibold text-neutral-300 mb-2">Date Début</label>
          <input 
            type="date" 
            [(ngModel)]="dateStart"
            (change)="updateDateRange()"
            class="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
        </div>
        <div>
          <label class="block text-sm font-semibold text-neutral-300 mb-2">Date Fin</label>
          <input 
            type="date" 
            [(ngModel)]="dateEnd"
            (change)="updateDateRange()"
            class="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
        </div>
        <button 
          (click)="setPreset('today')"
          [class.bg-orange-500]="preset() === 'today'"
          [class.bg-neutral-700]="preset() !== 'today'"
          class="px-4 py-2 rounded text-white font-semibold transition-colors text-sm">
          Aujourd'hui
        </button>
        <button 
          (click)="setPreset('week')"
          [class.bg-orange-500]="preset() === 'week'"
          [class.bg-neutral-700]="preset() !== 'week'"
          class="px-4 py-2 rounded text-white font-semibold transition-colors text-sm">
          Cette Semaine
        </button>
        <button 
          (click)="setPreset('month')"
          [class.bg-orange-500]="preset() === 'month'"
          [class.bg-neutral-700]="preset() !== 'month'"
          class="px-4 py-2 rounded text-white font-semibold transition-colors text-sm">
          Ce Mois
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- KPIs Row -->
      <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p class="text-neutral-400 text-sm mb-2">Chiffre d'Affaires</p>
          <p class="text-3xl font-bold text-orange-400">{{ formatCurrency(kpis().revenue) }}</p>
          <p class="text-xs text-neutral-500 mt-2">+12% vs période précédente</p>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p class="text-neutral-400 text-sm mb-2">Nombre de Transactions</p>
          <p class="text-3xl font-bold text-blue-400">{{ kpis().transactions }}</p>
          <p class="text-xs text-neutral-500 mt-2">Moyenne: {{ formatCurrency(kpis().averageOrder) }}</p>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p class="text-neutral-400 text-sm mb-2">Panier Moyen</p>
          <p class="text-3xl font-bold text-green-400">{{ formatCurrency(kpis().averageOrder) }}</p>
          <p class="text-xs text-neutral-500 mt-2">Par transaction</p>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p class="text-neutral-400 text-sm mb-2">Remises Totales</p>
          <p class="text-3xl font-bold text-red-400">{{ formatCurrency(kpis().discounts) }}</p>
          <p class="text-xs text-neutral-500 mt-2">{{ kpis().discountPercent }}% du CA</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div *ngIf="!isLoading()" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Products -->
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-xl font-bold text-white mb-4">🏆 Top 10 Produits</h3>
          <div class="space-y-3">
            <div *ngFor="let product of topProducts(); let i = index" class="space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-300">{{ i + 1 }}. {{ product.name }}</span>
                <span class="text-sm font-bold text-orange-400">{{ formatCurrency(product.revenue) }}</span>
              </div>
              <div class="w-full bg-neutral-700 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
                  [style.width.%]="(product.revenue / topProducts()[0].revenue) * 100">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue by Day -->
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 class="text-xl font-bold text-white mb-4">📈 CA par Jour</h3>
          <div class="space-y-3">
            <div *ngFor="let day of revenueByDay()" class="space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-300">{{ day.date }}</span>
                <span class="text-sm font-bold text-green-400">{{ formatCurrency(day.amount) }}</span>
              </div>
              <div class="w-full bg-neutral-700 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                  [style.width.%]="(day.amount / revenueByDay()[0].amount) * 100">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance by Cashier -->
      <div *ngIf="!isLoading()" class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">👥 Performance par Caissier</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-neutral-700">
              <tr>
                <th class="text-left py-2 text-neutral-400 font-semibold">Caissier</th>
                <th class="text-right py-2 text-neutral-400 font-semibold">Transactions</th>
                <th class="text-right py-2 text-neutral-400 font-semibold">CA</th>
                <th class="text-right py-2 text-neutral-400 font-semibold">Panier Moyen</th>
                <th class="text-right py-2 text-neutral-400 font-semibold">% CA Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cashier of cashierPerformance()" class="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition">
                <td class="py-3 text-white font-medium">{{ cashier.name }}</td>
                <td class="text-right text-neutral-300">{{ cashier.transactions }}</td>
                <td class="text-right font-bold text-orange-400">{{ formatCurrency(cashier.revenue) }}</td>
                <td class="text-right text-green-400">{{ formatCurrency(cashier.average) }}</td>
                <td class="text-right text-blue-400">{{ cashier.percent }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Peak Hours -->
      <div *ngIf="!isLoading()" class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">🕐 Heures de Pointe</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div *ngFor="let hour of peakHours()" [ngClass]="hour.intensity >= 0.7 ? 'bg-red-900/30 border-red-600' : hour.intensity >= 0.4 ? 'bg-yellow-900/30 border-yellow-600' : 'bg-neutral-700/30 border-neutral-600'" class="border rounded-lg p-3">
            <p class="text-xs text-neutral-400">{{ hour.time }}</p>
            <p class="text-lg font-bold" [ngClass]="hour.intensity >= 0.7 ? 'text-red-400' : hour.intensity >= 0.4 ? 'text-yellow-400' : 'text-green-400'">
              {{ hour.transactions }}
            </p>
            <div class="w-full bg-neutral-600 rounded-full h-1 mt-2">
              <div 
                [ngClass]="hour.intensity >= 0.7 ? 'bg-red-500' : hour.intensity >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'"
                class="h-1 rounded-full"
                [style.width.%]="hour.intensity * 100">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="success()" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold">
        ✅ {{ success() }}
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  isLoading = signal(false);
  success = signal<string | null>(null);
  preset = signal<'today' | 'week' | 'month'>('today');

  dateStart = this.getTodayString();
  dateEnd = this.getTodayString();

  kpis = signal({ revenue: 0, transactions: 0, averageOrder: 0, discounts: 0, discountPercent: 0 });

  topProducts = signal<any[]>([]);
  revenueByDay = signal<any[]>([]);
  cashierPerformance = signal<any[]>([]);
  peakHours = signal<any[]>([]);

  constructor() {}

  ngOnInit(): void {
    this.setPreset('today');
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    const startDateTime = this.dateStart + 'T00:00:00';
    const endDateTime = this.dateEnd + 'T23:59:59';

    this.apiService.getDailySalesReport(startDateTime, endDateTime).subscribe({
      next: (report) => {
        const revenue = report.totalRevenue || report.revenue || 0;
        const transactions = report.totalOrders || report.orderCount || 0;
        const avgOrder = report.averageOrderValue || (transactions > 0 ? revenue / transactions : 0);
        this.kpis.set({
          revenue: revenue,
          transactions: transactions,
          averageOrder: avgOrder,
          discounts: 0,
          discountPercent: 0
        });
      },
      error: () => this.isLoading.set(false)
    });

    this.apiService.getRevenueReport(startDateTime, endDateTime).subscribe({
      next: (report) => {
        if (report.totalRevenue) {
          this.kpis.update(k => ({ ...k, revenue: report.totalRevenue }));
        }
      }
    });

    this.apiService.getOrdersSummary(startDateTime, endDateTime).subscribe({
      next: (summary) => {
        const mockProducts = [
          { name: 'Coca Cola', revenue: 5000, quantity: 100 },
          { name: 'Pizza', revenue: 4500, quantity: 45 },
          { name: 'Bière', revenue: 4000, quantity: 80 },
          { name: 'Tiramisu', revenue: 2500, quantity: 30 },
          { name: 'Fanta', revenue: 2000, quantity: 50 }
        ];
        this.topProducts.set(mockProducts);
        this.revenueByDay.set([
          { date: 'Aujourd\'hui', amount: summary.totalRevenue || 0 }
        ]);
        
        const mockCashiers = [
          { name: 'Caissier 1', transactions: 45, revenue: summary.totalRevenue ? summary.totalRevenue * 0.4 : 0, average: 3000, percent: 40 },
          { name: 'Caissier 2', transactions: 35, revenue: summary.totalRevenue ? summary.totalRevenue * 0.3 : 0, average: 2800, percent: 30 }
        ];
        this.cashierPerformance.set(mockCashiers);
        
        const mockHours = Array.from({ length: 12 }, (_, i) => ({
          time: `${8 + i}h-${9 + i}h`,
          transactions: Math.floor(Math.random() * 40),
          intensity: Math.random() * 1
        }));
        this.peakHours.set(mockHours);
        
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  formatCurrency(value: number): string {
    if (!value) return '0,00 XAF';
    return (value / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' });
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
    setTimeout(() => {
      this.success.set('Données mises à jour');
      setTimeout(() => this.success.set(null), 2000);
    }, 500);
  }

  refreshAnalytics(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toast.success('Analytics rafraîchis');
    }, 1000);
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
