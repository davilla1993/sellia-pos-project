import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

interface AuditLog {
  publicId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  actionDate: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage: string;
  createdAt: string;
}

interface AuditStats {
  totalLogs: number;
  successLogs: number;
  failedLogs: number;
  successRate: number;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-white">Audit Logs</h1>
          <p class="text-neutral-400">Surveillance des activités de l'application</p>
        </div>
        <button (click)="loadData()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
          Rafraîchir
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4" *ngIf="stats()">
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="text-neutral-400 text-sm">Total Logs</div>
          <div class="text-2xl font-bold text-white">{{ stats()!.totalLogs | number }}</div>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="text-neutral-400 text-sm">Succès</div>
          <div class="text-2xl font-bold text-green-400">{{ stats()!.successLogs | number }}</div>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="text-neutral-400 text-sm">Échecs</div>
          <div class="text-2xl font-bold text-red-400">{{ stats()!.failedLogs | number }}</div>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="text-neutral-400 text-sm">Taux de Succès</div>
          <div class="text-2xl font-bold text-blue-400">{{ stats()!.successRate | number:'1.1-1' }}%</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- User Filter -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1">Utilisateur</label>
            <input type="text"
                   [(ngModel)]="filterUser"
                   placeholder="Email..."
                   class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary">
          </div>

          <!-- Entity Type Filter -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1">Type d'entité</label>
            <select [(ngModel)]="filterEntityType"
                    class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
              <option value="">Tous</option>
              <option value="Order">Commande</option>
              <option value="Product">Produit</option>
              <option value="User">Utilisateur</option>
              <option value="Session">Session</option>
              <option value="CashierSession">Session Caisse</option>
              <option value="GlobalSession">Session Globale</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1">Statut</label>
            <select [(ngModel)]="filterStatus"
                    class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
              <option value="">Tous</option>
              <option value="SUCCESS">Succès</option>
              <option value="FAILED">Échec</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1">Date début</label>
            <input type="datetime-local"
                   [(ngModel)]="filterStartDate"
                   class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
          </div>

          <div>
            <label class="block text-sm text-neutral-400 mb-1">Date fin</label>
            <input type="datetime-local"
                   [(ngModel)]="filterEndDate"
                   class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button (click)="applyFilters()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            Appliquer
          </button>
          <button (click)="resetFilters()" class="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors">
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-neutral-700/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Utilisateur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Action</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Entité</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">IP</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Détails</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-700">
              <tr *ngFor="let log of logs()" class="hover:bg-neutral-700/30">
                <td class="px-4 py-3 text-sm text-white whitespace-nowrap">
                  {{ formatDate(log.actionDate) }}
                </td>
                <td class="px-4 py-3 text-sm text-neutral-300">
                  {{ log.userEmail }}
                </td>
                <td class="px-4 py-3 text-sm text-neutral-300">
                  {{ log.action }}
                </td>
                <td class="px-4 py-3 text-sm text-neutral-300">
                  <span class="px-2 py-1 bg-neutral-700 rounded text-xs">{{ log.entityType }}</span>
                  <span *ngIf="log.entityId" class="ml-1 text-xs text-neutral-500">{{ log.entityId | slice:0:8 }}...</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 rounded text-xs font-medium"
                        [class.bg-green-900/50]="log.status === 'SUCCESS'"
                        [class.text-green-400]="log.status === 'SUCCESS'"
                        [class.bg-red-900/50]="log.status === 'FAILED'"
                        [class.text-red-400]="log.status === 'FAILED'">
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-neutral-400">
                  {{ log.ipAddress }}
                </td>
                <td class="px-4 py-3 text-sm text-neutral-400 max-w-xs truncate" [title]="log.details || log.errorMessage">
                  {{ log.details || log.errorMessage || '-' }}
                </td>
              </tr>
              <tr *ngIf="logs().length === 0 && !loading()">
                <td colspan="7" class="px-4 py-8 text-center text-neutral-500">
                  Aucun log trouvé
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 bg-neutral-700/50 flex items-center justify-between">
          <div class="text-sm text-neutral-400">
            Page {{ currentPage() + 1 }} sur {{ totalPages() }}
            ({{ totalElements() }} éléments)
          </div>
          <div class="flex gap-2">
            <button (click)="previousPage()"
                    [disabled]="currentPage() === 0"
                    class="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Précédent
            </button>
            <button (click)="nextPage()"
                    [disabled]="currentPage() >= totalPages() - 1"
                    class="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 text-center">
          <div class="animate-spin text-4xl mb-2">&#9696;</div>
          <p class="text-white">Chargement...</p>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  private apiService = inject(ApiService);

  logs = signal<AuditLog[]>([]);
  stats = signal<AuditStats | null>(null);
  loading = signal(false);

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 50;

  // Filters
  filterUser = '';
  filterEntityType = '';
  filterStatus = '';
  filterStartDate = '';
  filterEndDate = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Load stats
    this.apiService.getAuditStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err)
    });

    // Load logs
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);

    let request;

    if (this.filterUser) {
      request = this.apiService.getAuditLogsByUser(this.filterUser, this.currentPage(), this.pageSize);
    } else if (this.filterEntityType) {
      request = this.apiService.getAuditLogsByEntityType(this.filterEntityType, this.currentPage(), this.pageSize);
    } else if (this.filterStatus) {
      request = this.apiService.getAuditLogsByStatus(this.filterStatus, this.currentPage(), this.pageSize);
    } else if (this.filterStartDate && this.filterEndDate) {
      request = this.apiService.getAuditLogsByDateRange(this.filterStartDate, this.filterEndDate, this.currentPage(), this.pageSize);
    } else {
      request = this.apiService.getAuditLogs(this.currentPage(), this.pageSize);
    }

    request.subscribe({
      next: (data) => {
        this.logs.set(data.content || []);
        this.totalPages.set(data.totalPages || 0);
        this.totalElements.set(data.totalElements || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading logs:', err);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
    this.loadLogs();
  }

  resetFilters(): void {
    this.filterUser = '';
    this.filterEntityType = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.currentPage.set(0);
    this.loadLogs();
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadLogs();
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
