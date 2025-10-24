import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-active-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Sessions Caisses Actives</h1>
          <p class="text-neutral-400">Suivi en temps réel de tous les caissiers connectés</p>
        </div>
        <button (click)="refreshSessions()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
          🔄 Rafraîchir
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Sessions Actives</p>
              <p class="text-3xl font-bold text-green-500">{{ activeSessions().length }}</p>
            </div>
            <div class="text-4xl opacity-30">👥</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Chiffre d'Affaires</p>
              <p class="text-3xl font-bold text-orange-500">{{ formatCurrency(totalSales()) }}</p>
            </div>
            <div class="text-4xl opacity-30">💰</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Total Commandes</p>
              <p class="text-3xl font-bold text-blue-500">{{ totalOrders() }}</p>
            </div>
            <div class="text-4xl opacity-30">📋</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Inactif depuis</p>
              <p class="text-3xl font-bold text-red-500">{{ maxInactivity() }}m</p>
            </div>
            <div class="text-4xl opacity-30">⏱️</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- Sessions Table -->
      <div *ngIf="!isLoading() && activeSessions().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table class="w-full">
          <thead class="bg-neutral-700 border-b border-neutral-600">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Caissier</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Utilisateur</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Statut</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Inactif</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Commandes</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">CA Session</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Durée</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Depuis</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let session of activeSessions()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
              <!-- Caissier -->
              <td class="px-6 py-4">
                <div class="text-white font-semibold">{{ session.cashierName }}</div>
                <div class="text-xs text-neutral-400">{{ session.cashierNumber }}</div>
              </td>

              <!-- Utilisateur -->
              <td class="px-6 py-4">
                <div class="text-white">{{ session.userName }}</div>
                <div class="text-xs text-neutral-400">{{ session.userEmail }}</div>
              </td>

              <!-- Statut -->
              <td class="px-6 py-4">
                <span [class]="getStatusClass(session.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ getStatusLabel(session.status) }}
                </span>
              </td>

              <!-- Inactif depuis -->
              <td class="px-6 py-4">
                <span [class]="getInactivityClass(session.lastActivity)" class="font-mono">
                  {{ getInactivityMinutes(session.lastActivity) }}m
                </span>
              </td>

              <!-- Commandes -->
              <td class="px-6 py-4 text-center">
                <span class="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {{ session.orderCount || 0 }}
                </span>
              </td>

              <!-- CA Session -->
              <td class="px-6 py-4 font-semibold text-green-400">
                {{ formatCurrency(session.totalSales || 0) }}
              </td>

              <!-- Durée -->
              <td class="px-6 py-4 text-neutral-300">
                {{ calculateDuration(session.openedAt, null) }}
              </td>

              <!-- Depuis -->
              <td class="px-6 py-4 text-xs text-neutral-400">
                {{ formatTime(session.openedAt) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <button 
                  *ngIf="session.status === 'OPEN'"
                  (click)="forceCloseSession(session)"
                  class="text-red-400 hover:text-red-300 text-sm font-medium">
                  🔒 Forcer Fermeture
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && activeSessions().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
        <p class="text-neutral-400 text-lg">Aucune session active</p>
        <p class="text-neutral-500 text-sm mt-2">Les caissiers apparaîtront ici une fois connectés</p>
      </div>

      <!-- Error Toast -->
      <div *ngIf="error()" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg">
        {{ error() }}
      </div>
    </div>
  `,
  styles: []
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
