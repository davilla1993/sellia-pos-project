import { Component, OnInit, inject, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6">
      <!-- Revenue Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">📈 Chiffre d'Affaires par Jour</h3>
        <canvas 
          baseChart 
          [type]="'line'"
          [data]="revenueChartData"
          [options]="revenueChartOptions">
        </canvas>
      </div>

      <!-- Top Products Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">🏆 Top 10 Produits</h3>
        <canvas 
          baseChart 
          [type]="'bar'"
          [data]="productsChartData"
          [options]="productsChartOptions">
        </canvas>
      </div>

      <!-- Cashier Performance Pie Chart -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">👥 Répartition par Caissier</h3>
        <canvas 
          baseChart 
          [type]="'doughnut'"
          [data]="cashierChartData"
          [options]="cashierChartOptions">
        </canvas>
      </div>

      <!-- Peak Hours Heatmap-style -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white mb-4">🕐 Heures de Pointe</h3>
        <canvas 
          baseChart 
          [type]="'bar'"
          [data]="hoursChartData"
          [options]="hoursChartOptions">
        </canvas>
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsChartsComponent implements OnInit {
  revenueData = input<any[]>([]);
  productsData = input<any[]>([]);
  cashierData = input<any[]>([]);
  peakHoursData = input<any[]>([]);

  revenueChartData: any = {
    labels: [],
    datasets: [{ data: [], label: '', borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)' }]
  };
  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, labels: { color: '#a3a3a3' } }
    },
    scales: {
      y: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#404040' }
      },
      x: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#404040' }
      }
    }
  };

  productsChartData: any = {
    labels: [],
    datasets: [{ data: [], label: '' }]
  };
  productsChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: { color: '#a3a3a3' },
        grid: { display: false }
      },
      x: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#404040' }
      }
    }
  };

  cashierChartData: any = {
    labels: [],
    datasets: [{ data: [], label: '' }]
  };
  cashierChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#a3a3a3' } }
    }
  };

  hoursChartData: any = {
    labels: [],
    datasets: [{ data: [], label: '' }]
  };
  hoursChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#404040' }
      },
      x: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#404040' }
      }
    }
  };

  ngOnInit(): void {
    effect(() => {
      this.updateRevenueChart();
      this.updateProductsChart();
      this.updateCashierChart();
      this.updateHoursChart();
    });
  }

  private updateRevenueChart(): void {
    const data = this.revenueData();
    this.revenueChartData = {
      labels: data.map(d => d.date || ''),
      datasets: [
        {
          label: 'Chiffre d\'Affaires (XAF)',
          data: data.map(d => d.amount || 0),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff'
        }
      ]
    };
  }

  private updateProductsChart(): void {
    const data = this.productsData().slice(0, 10);
    this.productsChartData = {
      labels: data.map(p => p.name || ''),
      datasets: [
        {
          label: 'Revenus (XAF)',
          data: data.map(p => p.revenue || 0),
          backgroundColor: [
            '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4',
            '#10b981', '#eab308', '#ec4899', '#6366f1', '#f59e0b'
          ]
        }
      ]
    };
  }

  private updateCashierChart(): void {
    const data = this.cashierData();
    this.cashierChartData = {
      labels: data.map(c => c.name || ''),
      datasets: [
        {
          data: data.map(c => c.revenue || 0),
          backgroundColor: [
            '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4'
          ],
          borderColor: '#1a0f06',
          borderWidth: 2
        }
      ]
    };
  }

  private updateHoursChart(): void {
    const data = this.peakHoursData();
    this.hoursChartData = {
      labels: data.map(h => h.time || ''),
      datasets: [
        {
          label: 'Transactions',
          data: data.map(h => h.transactions || 0),
          backgroundColor: data.map((h, i) => {
            const intensity = h.intensity || 0;
            if (intensity > 0.7) return '#ef4444';
            if (intensity > 0.4) return '#eab308';
            return '#10b981';
          }),
          borderRadius: 4
        }
      ]
    };
  }
}
