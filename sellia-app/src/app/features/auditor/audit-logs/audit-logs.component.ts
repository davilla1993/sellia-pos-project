import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Audit Logs
          </h1>
          <p class="text-neutral-400 ml-10">Surveillance des activités de l'application</p>
        </div>
        <div class="flex gap-2">
          <button (click)="exportToPDF()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exporter PDF
          </button>
          <button (click)="loadData()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Rafraîchir
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4" *ngIf="stats()">
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-neutral-400 text-sm">Total Logs</div>
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-white">{{ stats()!.totalLogs | number }}</div>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-neutral-400 text-sm">Succès</div>
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-green-400">{{ stats()!.successLogs | number }}</div>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-neutral-400 text-sm">Échecs</div>
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-red-400">{{ stats()!.failedLogs | number }}</div>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-neutral-400 text-sm">Taux de Succès</div>
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-blue-400">{{ stats()!.successRate | number:'1.1-1' }}%</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          <h3 class="text-white font-medium">Filtres</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- User Filter -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Utilisateur
            </label>
            <input type="text"
                   [(ngModel)]="filterUser"
                   placeholder="Email..."
                   (keyup.enter)="applyFilters()"
                   class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary">
          </div>

          <!-- Entity Type Filter -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
              </svg>
              Type d'entité
            </label>
            <select [(ngModel)]="filterEntityType"
                    (change)="applyFilters()"
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
            <label class="block text-sm text-neutral-400 mb-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Statut
            </label>
            <select [(ngModel)]="filterStatus"
                    (change)="applyFilters()"
                    class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
              <option value="">Tous</option>
              <option value="SUCCESS">Succès</option>
              <option value="FAILED">Échec</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm text-neutral-400 mb-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Date début
            </label>
            <input type="datetime-local"
                   [(ngModel)]="filterStartDate"
                   class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
          </div>

          <div>
            <label class="block text-sm text-neutral-400 mb-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Date fin
            </label>
            <input type="datetime-local"
                   [(ngModel)]="filterEndDate"
                   class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary">
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button (click)="applyFilters()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Appliquer
          </button>
          <button (click)="resetFilters()" class="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
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
                  <span class="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit"
                        [class.bg-green-900/50]="log.status === 'SUCCESS'"
                        [class.text-green-400]="log.status === 'SUCCESS'"
                        [class.bg-red-900/50]="log.status === 'FAILED'"
                        [class.text-red-400]="log.status === 'FAILED'">
                    <svg *ngIf="log.status === 'SUCCESS'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <svg *ngIf="log.status === 'FAILED'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-neutral-400 whitespace-nowrap">
                  {{ log.ipAddress }}
                </td>
                <td class="px-4 py-3 text-sm text-neutral-400">
                  <div class="max-w-md break-words" [title]="log.details || log.errorMessage">
                    {{ log.details || log.errorMessage || '-' }}
                  </div>
                </td>
              </tr>
              <tr *ngIf="logs().length === 0 && !loading()">
                <td colspan="7" class="px-4 py-8 text-center text-neutral-500">
                  <div class="flex flex-col items-center gap-2">
                    <svg class="w-12 h-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p>Aucun log trouvé</p>
                  </div>
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
                    class="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Précédent
            </button>
            <button (click)="nextPage()"
                    [disabled]="currentPage() >= totalPages() - 1"
                    class="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
              Suivant
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 text-center border border-neutral-700">
          <svg class="animate-spin h-12 w-12 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
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
  pageSize = 100;

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

    // Use the flexible search endpoint that supports multiple filters
    const userEmail = this.filterUser.trim() || null;
    const entityType = this.filterEntityType || null;
    const status = this.filterStatus || null;
    const startDate = this.filterStartDate || null;
    const endDate = this.filterEndDate || null;

    this.apiService.searchAuditLogs(
      userEmail,
      entityType,
      status,
      startDate,
      endDate,
      this.currentPage(),
      this.pageSize
    ).subscribe({
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

  exportToPDF(): void {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Logs d\'Audit', pageWidth / 2, 15, { align: 'center' });

    // Date and filters info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let filterText = 'Période: ';
    if (this.filterStartDate && this.filterEndDate) {
      filterText += `${this.filterStartDate} - ${this.filterEndDate}`;
    } else {
      filterText += 'Toutes les dates';
    }
    if (this.filterUser) filterText += ` | Utilisateur: ${this.filterUser}`;
    if (this.filterEntityType) filterText += ` | Type: ${this.filterEntityType}`;
    if (this.filterStatus) filterText += ` | Statut: ${this.filterStatus}`;
    doc.text(filterText, pageWidth / 2, 22, { align: 'center' });

    // Stats summary
    if (this.stats()) {
      const statsText = `Total: ${this.stats()!.totalLogs} logs | Succès: ${this.stats()!.successLogs} (${this.stats()!.successRate}%) | Échecs: ${this.stats()!.failedLogs}`;
      doc.text(statsText, pageWidth / 2, 28, { align: 'center' });
    }

    // Prepare table data
    const tableData = this.logs().map(log => [
      this.formatDate(log.actionDate),
      log.userEmail,
      log.action,
      log.entityType + (log.entityId ? '\n' + log.entityId.substring(0, 12) : ''),
      log.status,
      log.ipAddress || '-',
      log.details || log.errorMessage || '-'
    ]);

    // Generate table
    autoTable(doc, {
      startY: 35,
      head: [['Date', 'Utilisateur', 'Action', 'Entité', 'Statut', 'IP', 'Détails']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 38 },
        2: { cellWidth: 25 },
        3: { cellWidth: 28 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25 },
        6: { cellWidth: 'auto', minCellHeight: 8 }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const status = data.cell.raw as string;
          if (status === 'SUCCESS') {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'FAILED') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Footer with export date and page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      doc.text(`Exporté le ${new Date().toLocaleString('fr-FR')}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    // Save PDF
    const filename = `logs-audit-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
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
