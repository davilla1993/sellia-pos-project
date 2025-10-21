import { Component, AfterViewInit, input, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Revenue Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">📈 Chiffre d'Affaires par Jour</h3>
        <canvas #revenueCanvas class="max-w-full"></canvas>
      </div>

      <!-- Top Products Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">🏆 Top 10 Produits</h3>
        <canvas #productsCanvas class="max-w-full"></canvas>
      </div>

      <!-- Cashier Performance Pie Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">👥 Répartition par Caissier</h3>
        <canvas #cashierCanvas class="max-w-full"></canvas>
      </div>

      <!-- Peak Hours Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">🕐 Heures de Pointe</h3>
        <canvas #hoursCanvas class="max-w-full"></canvas>
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsChartsComponent implements AfterViewInit {
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef;
  @ViewChild('productsCanvas') productsCanvas!: ElementRef;
  @ViewChild('cashierCanvas') cashierCanvas!: ElementRef;
  @ViewChild('hoursCanvas') hoursCanvas!: ElementRef;

  revenueData = input<any[]>([]);
  productsData = input<any[]>([]);
  cashierData = input<any[]>([]);
  peakHoursData = input<any[]>([]);

  private revenueChart: Chart | null = null;
  private productsChart: Chart | null = null;
  private cashierChart: Chart | null = null;
  private hoursChart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderCharts();
    
    effect(() => {
      const rev = this.revenueData();
      const prod = this.productsData();
      const cash = this.cashierData();
      const hours = this.peakHoursData();
      
      if (rev.length > 0 || prod.length > 0 || cash.length > 0 || hours.length > 0) {
        this.renderCharts();
      }
    });
  }

  private renderCharts(): void {
    this.renderRevenueChart();
    this.renderProductsChart();
    this.renderCashierChart();
    this.renderHoursChart();
  }

  private renderRevenueChart(): void {
    const data = this.revenueData();
    if (!this.revenueCanvas?.nativeElement || data.length === 0) return;

    if (this.revenueChart) this.revenueChart.destroy();

    this.revenueChart = new Chart(this.revenueCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => d.date || ''),
        datasets: [{
          label: 'Chiffre d\'Affaires (XAF)',
          data: data.map(d => d.amount || 0),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true, labels: { color: '#a3a3a3' } }
        },
        scales: {
          y: { ticks: { color: '#a3a3a3' }, grid: { color: '#404040' } },
          x: { ticks: { color: '#a3a3a3' }, grid: { color: '#404040' } }
        }
      }
    });
  }

  private renderProductsChart(): void {
    const data = this.productsData().slice(0, 10);
    if (!this.productsCanvas?.nativeElement || data.length === 0) return;

    if (this.productsChart) this.productsChart.destroy();

    this.productsChart = new Chart(this.productsCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(p => p.name || ''),
        datasets: [{
          label: 'Revenus (XAF)',
          data: data.map(p => p.revenue || 0),
          backgroundColor: ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#eab308', '#ec4899', '#6366f1', '#f59e0b']
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#a3a3a3' }, grid: { display: false } },
          x: { ticks: { color: '#a3a3a3' }, grid: { color: '#404040' } }
        }
      }
    });
  }

  private renderCashierChart(): void {
    const data = this.cashierData();
    if (!this.cashierCanvas?.nativeElement || data.length === 0) return;

    if (this.cashierChart) this.cashierChart.destroy();

    this.cashierChart = new Chart(this.cashierCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map(c => c.name || ''),
        datasets: [{
          data: data.map(c => c.revenue || 0),
          backgroundColor: ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4'],
          borderColor: '#1a0f06',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'right', labels: { color: '#a3a3a3' } } }
      }
    });
  }

  private renderHoursChart(): void {
    const data = this.peakHoursData();
    if (!this.hoursCanvas?.nativeElement || data.length === 0) return;

    if (this.hoursChart) this.hoursChart.destroy();

    this.hoursChart = new Chart(this.hoursCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(h => h.time || ''),
        datasets: [{
          label: 'Transactions',
          data: data.map(h => h.transactions || 0),
          backgroundColor: data.map(h => {
            const intensity = h.intensity || 0;
            return intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#eab308' : '#10b981';
          }),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#a3a3a3' }, grid: { color: '#404040' } },
          x: { ticks: { color: '#a3a3a3' }, grid: { color: '#404040' } }
        }
      }
    });
  }
}
