import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-session-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-report.html',
  styleUrl: './session-report.scss'
})
export class SessionReportComponent implements OnInit {
  @Input() sessionId!: string;
  @Input() autoLoad: boolean = true;

  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  report = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.autoLoad && this.sessionId) {
      this.loadReport();
    }
  }

  loadReport(): void {
    if (!this.sessionId) {
      this.error.set('Session ID manquant');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.apiService.getSessionReport(this.sessionId).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement du rapport');
        this.loading.set(false);
        this.toast.error('Erreur lors du chargement du rapport');
      }
    });
  }

  print(): void {
    window.print();
  }

  formatCurrency(value: number | null | undefined): string {
    if (!value && value !== 0) return '0 FCFA';
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }

  formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(): string {
    const r = this.report();
    if (!r || !r.openedAt || !r.closedAt) return 'N/A';

    const start = new Date(r.openedAt);
    const end = new Date(r.closedAt);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  getDiscrepancyClass(): string {
    const r = this.report();
    if (!r) return '';
    const disc = r.discrepancy || 0;
    if (disc > 0) return 'text-green-600';
    if (disc < 0) return 'text-red-600';
    return 'text-neutral-600';
  }

  getDiscrepancyLabel(): string {
    const r = this.report();
    if (!r) return '';
    const disc = r.discrepancy || 0;
    if (disc > 0) return 'Excédent';
    if (disc < 0) return 'Manque';
    return 'Équilibré';
  }

  getCurrentDateTime(): string {
    return this.formatDateTime(new Date().toISOString());
  }
}
