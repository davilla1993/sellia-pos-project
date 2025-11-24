import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogsService, LogEntry, LogStats } from '../../../core/services/logs.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

type TimeRange = '1h' | '3h' | '6h' | '12h' | '1d' | '1w' | '1m' | 'custom';

@Component({
  selector: 'app-application-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './application-logs.component.html',
  styleUrls: ['./application-logs.component.css']
})
export class ApplicationLogsComponent implements OnInit, OnDestroy {
  private logsService = inject(LogsService);

  // Make Math available in template
  Math = Math;

  // Signals
  logs = signal<LogEntry[]>([]);
  stats = signal<LogStats | null>(null);
  isLoading = signal(false);
  autoRefresh = signal(true);
  selectedTimeRange = signal<TimeRange>('1h');
  selectedLevel = signal<string>('ALL');
  searchText = signal<string>('');
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(25);

  // Computed
  filteredLogsCount = computed(() => this.logs().length);
  totalPages = computed(() => Math.ceil(this.logs().length / this.pageSize()));
  paginatedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.logs().slice(start, end);
  });

  // Chart data
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        label: 'Logs Count',
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // Blue for INFO
          'rgba(234, 179, 8, 0.7)',    // Yellow for WARN
          'rgba(239, 68, 68, 0.7)',    // Red for ERROR
          'rgba(107, 114, 128, 0.7)'   // Gray for DEBUG
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 2
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Distribution des logs par niveau',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Subscriptions
  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    this.loadLogs();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Load logs based on current filters
   */
  loadLogs(): void {
    this.isLoading.set(true);

    const { startDate, endDate } = this.getDateRange();
    const level = this.selectedLevel();
    const search = this.searchText();

    // Load logs
    this.logsService.getLogs(startDate, endDate, level, search).subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.isLoading.set(false);
      }
    });

    // Load stats
    this.logsService.getStats(startDate, endDate).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.updateChartData(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Get date range based on selected time range
   */
  private getDateRange(): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    let startDate = new Date();

    switch (this.selectedTimeRange()) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '3h':
        startDate.setHours(endDate.getHours() - 3);
        break;
      case '6h':
        startDate.setHours(endDate.getHours() - 6);
        break;
      case '12h':
        startDate.setHours(endDate.getHours() - 12);
        break;
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1w':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'custom':
        if (this.customStartDate()) {
          startDate = new Date(this.customStartDate());
        }
        if (this.customEndDate()) {
          endDate.setTime(new Date(this.customEndDate()).getTime());
        }
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Update chart data
   */
  private updateChartData(stats: LogStats): void {
    this.barChartData.datasets[0].data = [
      stats.infoCount,
      stats.warnCount,
      stats.errorCount,
      stats.debugCount
    ];
  }

  /**
   * Select time range
   */
  selectTimeRange(range: TimeRange): void {
    this.selectedTimeRange.set(range);
    this.currentPage.set(1);
    if (range !== 'custom') {
      this.loadLogs();
    }
  }

  /**
   * Apply custom date range
   */
  applyCustomDateRange(): void {
    if (this.customStartDate() && this.customEndDate()) {
      this.loadLogs();
    }
  }

  /**
   * Change level filter
   */
  changeLevel(level: string): void {
    this.selectedLevel.set(level);
    this.currentPage.set(1);
    this.loadLogs();
  }

  /**
   * Search logs
   */
  search(): void {
    this.currentPage.set(1);
    this.loadLogs();
  }

  /**
   * Clear all logs
   */
  clearAllLogs(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les logs ?')) {
      this.logsService.clearLogs().subscribe({
        next: () => {
          this.logs.set([]);
          this.stats.set(null);
          this.currentPage.set(1);
          alert('Tous les logs ont été supprimés');
        },
        error: (error) => {
          console.error('Error clearing logs:', error);
          alert('Erreur lors de la suppression des logs');
        }
      });
    }
  }

  /**
   * Pagination methods
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }

  /**
   * Toggle auto refresh
   */
  toggleAutoRefresh(): void {
    this.autoRefresh.set(!this.autoRefresh());
    if (this.autoRefresh()) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  /**
   * Start auto refresh
   */
  private startAutoRefresh(): void {
    if (this.autoRefresh()) {
      this.refreshSubscription = interval(5000)
        .pipe(switchMap(() => {
          const { startDate, endDate } = this.getDateRange();
          return this.logsService.getLogs(startDate, endDate, this.selectedLevel(), this.searchText());
        }))
        .subscribe({
          next: (logs) => {
            this.logs.set(logs);
          }
        });
    }
  }

  /**
   * Stop auto refresh
   */
  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * Export logs to PDF
   */
  exportToPDF(): void {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Logs de l\'Application', pageWidth / 2, 15, { align: 'center' });

    // Date range info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateRange = this.getDateRangeText();
    doc.text(dateRange, pageWidth / 2, 22, { align: 'center' });

    // Stats summary
    if (this.stats()) {
      doc.text(`Total: ${this.stats()!.totalLogs} logs | INFO: ${this.stats()!.infoCount} | WARN: ${this.stats()!.warnCount} | ERROR: ${this.stats()!.errorCount} | DEBUG: ${this.stats()!.debugCount}`, pageWidth / 2, 28, { align: 'center' });
    }

    // Prepare table data
    const tableData = this.logs().map(log => [
      this.formatTimestamp(log.timestamp),
      log.level,
      log.logger.substring(log.logger.lastIndexOf('.') + 1),
      log.message.length > 80 ? log.message.substring(0, 80) + '...' : log.message
    ]);

    // Generate table
    autoTable(doc, {
      startY: 35,
      head: [['Timestamp', 'Niveau', 'Logger', 'Message']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 50 },
        3: { cellWidth: 'auto' }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const level = data.cell.raw as string;
          if (level === 'ERROR') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (level === 'WARN') {
            data.cell.styles.textColor = [202, 138, 4];
            data.cell.styles.fontStyle = 'bold';
          } else if (level === 'INFO') {
            data.cell.styles.textColor = [37, 99, 235];
          }
        }
      }
    });

    // Footer with export date
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      doc.text(`Exporté le ${new Date().toLocaleString('fr-FR')}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    // Save PDF
    const filename = `logs-application-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  /**
   * Get date range text for PDF header
   */
  private getDateRangeText(): string {
    const range = this.selectedTimeRange();
    const rangeLabels: Record<TimeRange, string> = {
      '1h': 'Dernière heure',
      '3h': '3 dernières heures',
      '6h': '6 dernières heures',
      '12h': '12 dernières heures',
      '1d': 'Dernier jour',
      '1w': 'Dernière semaine',
      '1m': 'Dernier mois',
      'custom': 'Période personnalisée'
    };

    let text = `Période: ${rangeLabels[range]}`;
    if (this.selectedLevel() !== 'ALL') {
      text += ` | Niveau: ${this.selectedLevel()}`;
    }
    if (this.searchText()) {
      text += ` | Recherche: "${this.searchText()}"`;
    }
    return text;
  }

  /**
   * Get log level badge class
   */
  getLevelClass(level: string): string {
    switch (level) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('fr-FR');
  }
}
