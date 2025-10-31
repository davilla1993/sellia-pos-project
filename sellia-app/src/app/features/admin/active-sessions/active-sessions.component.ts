import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';
import { CurrencyService } from '@shared/services/currency.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-active-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.css']
})
export class ActiveSessionsComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  currencyService = inject(CurrencyService);
  
  activeSessions = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  private refreshSubscription: Subscription | null = null;

  totalSales = signal(0);
  totalOrders = signal(0);
  maxInactivity = signal(0);

  ngOnInit(): void {
    this.loadSessions();
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadSessions();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadSessions(): void {
    this.isLoading.set(true);
    this.apiService.getActiveCashierSessions().subscribe({
      next: (data) => {
        this.activeSessions.set(data);
        this.calculateStats();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement');
        this.isLoading.set(false);
      }
    });
  }

  refreshSessions(): void {
    this.loadSessions();
    this.toast.success('Sessions rafraîchies');
  }

  calculateStats(): void {
    const sessions = this.activeSessions();
    
    this.totalSales.set(
      sessions.reduce((sum, s) => sum + (s.totalSales || 0), 0)
    );
    
    this.totalOrders.set(
      sessions.reduce((sum, s) => sum + (s.orderCount || 0), 0)
    );

    const maxInactMin = Math.max(
      ...sessions.map(s => this.getInactivityMinutes(s.lastActivity)),
      0
    );
    this.maxInactivity.set(maxInactMin);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'OPEN': 'Ouvert',
      'LOCKED': 'Verrouillé',
      'CLOSED': 'Fermé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'OPEN': 'bg-green-900/30 text-green-300',
      'LOCKED': 'bg-yellow-900/30 text-yellow-300',
      'CLOSED': 'bg-red-900/30 text-red-300'
    };
    return classes[status] || 'bg-gray-900/30 text-gray-300';
  }

  getInactivityMinutes(lastActivity: string): number {
    if (!lastActivity) return 0;
    const last = new Date(lastActivity).getTime();
    const now = new Date().getTime();
    return Math.floor((now - last) / 1000 / 60);
  }

  getInactivityClass(lastActivity: string): string {
    const minutes = this.getInactivityMinutes(lastActivity);
    if (minutes > 10) return 'text-red-400';
    if (minutes > 5) return 'text-yellow-400';
    return 'text-green-400';
  }

  calculateDuration(openedAt: string, closedAt: string | null): string {
    if (!openedAt) return 'N/A';
    const start = new Date(openedAt).getTime();
    const end = closedAt ? new Date(closedAt).getTime() : new Date().getTime();
    const diff = end - start;
    
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    
    return `${hours}h ${minutes}m`;
  }

  formatTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const amountInFcfa = Math.round(value / 100);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }

  forceCloseSession(session: any): void {
    if (!confirm(`Êtes-vous sûr de vouloir fermer la session de ${session.userName}?`)) return;

    this.apiService.closeCashierSession(session.publicId, 0, 'Fermé par admin').subscribe({
      next: () => {
        this.toast.success('Session fermée');
        this.loadSessions();
      },
      error: () => this.error.set('Erreur lors de la fermeture')
    });
  }
}
