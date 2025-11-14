import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApiService } from '@core/services/api.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexTooltip,
  ApexNonAxisChartSeries,
  ApexResponsive
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  tooltip: ApexTooltip;
  labels: string[];
  responsive: ApexResponsive[];
  colors: string[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  loading = signal(true);

  // KPIs - Commandes encaissées (Chiffre d'affaires)
  totalRevenue = signal(0);
  totalTransactions = signal(0);
  averageOrderValue = signal(0);
  activeSessions = signal(0);

  // Nouvelles métriques
  ordersPlaced = signal(0);
  ordersPlacedAmount = signal(0);
  cancelledOrders = signal(0);
  cancelledOrdersAmount = signal(0);
  deliveredOrders = signal(0);
  deliveredOrdersAmount = signal(0);

  // Opérations de caisse
  totalCashEntrees = signal(0);
  countCashEntrees = signal(0);
  totalCashSorties = signal(0);
  countCashSorties = signal(0);

  // Charts
  revenueChartOptions!: Partial<ChartOptions>;
  topProductsChartOptions!: Partial<ChartOptions>;
  peakHoursChartOptions!: Partial<ChartOptions>;

  // Quick actions
  quickActions = [
    {
      title: 'Commandes Actives',
      description: 'Suivi en temps réel',
      icon: '📋',
      route: '/admin/active-orders',
      color: 'bg-blue-600'
    },
    {
      title: 'Sessions Actives',
      description: 'Caissiers en ligne',
      icon: '👥',
      route: '/admin/active-sessions',
      color: 'bg-green-600'
    },
    {
      title: 'Voir Rapports',
      description: 'Analyses détaillées',
      icon: '📈',
      route: '/admin/reports/sales',
      color: 'bg-purple-600'
    }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Get data for last 7 days
    const dateEnd = new Date();
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 6); // 7 days including today

    const startStr = this.formatDate(dateStart);
    const endStr = this.formatDate(dateEnd);

    this.apiService.getAnalyticsSummary(startStr, endStr).subscribe({
      next: (data) => {
        // Chiffre d'affaires (commandes encaissées)
        this.totalRevenue.set(data.totalRevenue || 0);
        this.totalTransactions.set(data.totalTransactions || 0);
        this.averageOrderValue.set(data.averageOrderValue || 0);

        // Nouvelles métriques
        this.ordersPlaced.set(data.ordersPlaced || 0);
        this.ordersPlacedAmount.set(data.ordersPlacedAmount || 0);
        this.cancelledOrders.set(data.cancelledOrders || 0);
        this.cancelledOrdersAmount.set(data.cancelledOrdersAmount || 0);
        this.deliveredOrders.set(data.deliveredOrders || 0);
        this.deliveredOrdersAmount.set(data.deliveredOrdersAmount || 0);

        // Opérations de caisse
        this.totalCashEntrees.set(data.totalCashEntrees || 0);
        this.countCashEntrees.set(data.countCashEntrees || 0);
        this.totalCashSorties.set(data.totalCashSorties || 0);
        this.countCashSorties.set(data.countCashSorties || 0);

        this.initializeCharts(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading.set(false);
      }
    });

    // Get active sessions
    this.apiService.getActiveSessions().subscribe({
      next: (count) => {
        this.activeSessions.set(count || 0);
      },
      error: (err) => console.error('Error loading active sessions:', err)
    });
  }

  initializeCharts(data: any): void {
    // Revenue by day chart
    const revenueData = data.revenueByDay || [];
    this.revenueChartOptions = {
      series: [{
        name: 'Chiffre d\'affaires',
        data: revenueData.map((d: any) => d.amount)
      }],
      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
        background: 'transparent'
      },
      colors: ['#FF6B35'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
        }
      },
      xaxis: {
        categories: revenueData.map((d: any) => d.date),
        labels: {
          style: { colors: '#9CA3AF' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#9CA3AF' },
          formatter: (val) => this.formatCurrency(val)
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => this.formatCurrency(val)
        }
      }
    };

    // Top products chart
    const topProducts = (data.topProducts || []).slice(0, 5);
    this.topProductsChartOptions = {
      series: [{
        name: 'Ventes',
        data: topProducts.map((p: any) => p.quantity || 0)
      }],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        background: 'transparent'
      },
      colors: ['#10B981'],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: topProducts.map((p: any) => p.name || 'N/A'),
        labels: {
          style: { colors: '#9CA3AF' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#9CA3AF' }
        }
      },
      tooltip: {
        theme: 'dark'
      }
    };

    // Peak hours chart
    const peakHours = data.peakHours || [];
    this.peakHoursChartOptions = {
      series: [{
        name: 'Commandes',
        data: peakHours.map((h: any) => h.transactions)
      }],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        background: 'transparent'
      },
      colors: ['#F59E0B'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%'
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: peakHours.map((h: any) => h.time),
        labels: {
          style: { colors: '#9CA3AF' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#9CA3AF' }
        }
      },
      tooltip: {
        theme: 'dark'
      }
    };
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
