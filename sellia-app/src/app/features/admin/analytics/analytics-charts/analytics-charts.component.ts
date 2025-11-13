import { Component, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
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
  xaxis?: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke?: ApexStroke;
  yaxis?: ApexYAxis;
  legend?: ApexLegend;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  labels?: string[];
  responsive?: ApexResponsive[];
  colors: string[];
};

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './analytics-charts.component.html',
  styleUrls: ['./analytics-charts.component.css']
})
export class AnalyticsChartsComponent implements OnInit {
  revenueData = input<any[]>([]);
  productsData = input<any[]>([]);
  cashierData = input<any[]>([]);
  peakHoursData = input<any[]>([]);

  revenueChartOptions!: Partial<ChartOptions>;
  productsChartOptions!: Partial<ChartOptions>;
  cashierChartOptions!: Partial<ChartOptions>;
  hoursChartOptions!: Partial<ChartOptions>;

  constructor() {
    // Use effect to update charts when data changes
    effect(() => {
      const revenue = this.revenueData();
      const products = this.productsData();
      const cashier = this.cashierData();
      const hours = this.peakHoursData();

      if (revenue.length > 0 || products.length > 0 || cashier.length > 0 || hours.length > 0) {
        this.initializeCharts();
      }
    });
  }

  ngOnInit(): void {
    this.initializeCharts();
  }

  private initializeCharts(): void {
    this.initRevenueChart();
    this.initProductsChart();
    this.initCashierChart();
    this.initHoursChart();
  }

  private initRevenueChart(): void {
    const data = this.revenueData();

    this.revenueChartOptions = {
      series: [{
        name: 'Chiffre d\'affaires (XAF)',
        data: data.map(d => d.amount || 0)
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        background: 'transparent'
      },
      colors: ['#f97316'],
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
        categories: data.map(d => d.date || ''),
        labels: {
          style: { colors: '#a3a3a3' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#a3a3a3' },
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
  }

  private initProductsChart(): void {
    const data = this.productsData().slice(0, 10);

    this.productsChartOptions = {
      series: [{
        name: 'Revenus (XAF)',
        data: data.map(p => p.revenue || 0)
      }],
      chart: {
        type: 'bar',
        height: 400,
        toolbar: { show: false },
        background: 'transparent'
      },
      colors: ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#eab308', '#ec4899', '#6366f1', '#f59e0b'],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          distributed: true
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: data.map(p => p.name || ''),
        labels: {
          style: { colors: '#a3a3a3' },
          formatter: (val) => this.formatCurrency(Number(val))
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#a3a3a3' }
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => this.formatCurrency(val)
        }
      }
    };
  }

  private initCashierChart(): void {
    const data = this.cashierData();

    this.cashierChartOptions = {
      series: data.map(c => c.revenue || 0),
      chart: {
        type: 'donut',
        height: 350,
        background: 'transparent'
      },
      labels: data.map(c => c.name || ''),
      colors: ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toFixed(1) + '%',
        style: {
          colors: ['#ffffff']
        }
      },
      legend: {
        position: 'right',
        labels: {
          colors: '#a3a3a3'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => this.formatCurrency(val)
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%'
          }
        }
      }
    };
  }

  private initHoursChart(): void {
    const data = this.peakHoursData();

    // Map intensity to colors
    const colors = data.map(h => {
      const intensity = h.intensity || 0;
      return intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#eab308' : '#10b981';
    });

    this.hoursChartOptions = {
      series: [{
        name: 'Transactions',
        data: data.map(h => h.transactions || 0)
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        background: 'transparent'
      },
      colors: colors,
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%',
          distributed: true
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: data.map(h => h.time || ''),
        labels: {
          style: { colors: '#a3a3a3' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#a3a3a3' }
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'dark'
      }
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
