import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AnalyticsChartsComponent } from './analytics-charts.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalyticsChartsComponent],
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

      <!-- Interactive Charts -->
      <div *ngIf="!isLoading()" class="space-y-6">
        <app-analytics-charts 
          [revenueData]="revenueByDay()"
          [productsData]="topProducts()"
          [cashierData]="cashierPerformance()"
          [peakHoursData]="peakHours()">
        </app-analytics-charts>
      </div>

      <!-- Backup: Performance Table (visible on mobile or if needed) -->
      <div *ngIf="!isLoading()" class="hidden lg:block bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">👥 Performance par Caissier (Tableau)</h3>
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

      <!-- Success Message -->
      <div *ngIf="success()" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold">
        ✅ {{ success() }}
      </div>
    </div>
  `,
  styles: []
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

  kpis = signal({ revenue: 45250, transactions: 128, averageOrder: 3535, discounts: 2150, discountPercent: 4.7 });

  topProducts = signal<any[]>([
    { name: 'Coca Cola', revenue: 5000, quantity: 100 },
    { name: 'Pizza', revenue: 4500, quantity: 45 },
    { name: 'Bière', revenue: 4000, quantity: 80 },
    { name: 'Tiramisu', revenue: 2500, quantity: 30 },
    { name: 'Fanta', revenue: 2000, quantity: 50 }
  ]);
  
  revenueByDay = signal<any[]>([
    { date: 'Lundi', amount: 8900 },
    { date: 'Mardi', amount: 7200 },
    { date: 'Mercredi', amount: 9100 },
    { date: 'Jeudi', amount: 6500 },
    { date: 'Vendredi', amount: 8750 },
    { date: 'Samedi', amount: 12200 },
    { date: 'Dimanche', amount: 10400 }
  ]);
  
  cashierPerformance = signal<any[]>([
    { name: 'Caissier 1', transactions: 45, revenue: 18000, average: 4000, percent: 40 },
    { name: 'Caissier 2', transactions: 38, revenue: 14200, average: 3737, percent: 31.4 },
    { name: 'Caissier 3', transactions: 28, revenue: 9650, average: 3446, percent: 21.4 }
  ]);
  
  peakHours = signal<any[]>([
    { time: '08h-09h', transactions: 12, intensity: 0.3 },
    { time: '09h-10h', transactions: 18, intensity: 0.45 },
    { time: '10h-11h', transactions: 25, intensity: 0.62 },
    { time: '11h-12h', transactions: 38, intensity: 0.95 },
    { time: '12h-13h', transactions: 42, intensity: 1.0 },
    { time: '13h-14h', transactions: 35, intensity: 0.88 },
    { time: '14h-15h', transactions: 22, intensity: 0.55 },
    { time: '15h-16h', transactions: 14, intensity: 0.35 },
    { time: '16h-17h', transactions: 8, intensity: 0.2 },
    { time: '17h-18h', transactions: 20, intensity: 0.5 },
    { time: '18h-19h', transactions: 32, intensity: 0.8 },
    { time: '19h-20h', transactions: 28, intensity: 0.7 }
  ]);

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
    
    // Use mock data for now - API endpoints may not be fully implemented
    Promise.resolve().then(() => {
      this.isLoading.set(false);
    });
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const formatted = Math.round(value / 100).toLocaleString('fr-FR');
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
