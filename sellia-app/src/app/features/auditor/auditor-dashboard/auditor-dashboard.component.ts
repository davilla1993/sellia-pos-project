import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboard Auditeur</h1>
        <p class="text-neutral-400">Vue d'ensemble de l'activité système</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Total Logs</div>
              <div class="text-3xl font-bold text-white mt-1">{{ stats()?.totalLogs | number }}</div>
            </div>
            <svg class="w-10 h-10 text-neutral-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Actions Réussies</div>
              <div class="text-3xl font-bold text-green-400 mt-1">{{ stats()?.successLogs | number }}</div>
            </div>
            <svg class="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Erreurs</div>
              <div class="text-3xl font-bold text-red-400 mt-1">{{ stats()?.failedLogs | number }}</div>
            </div>
            <svg class="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Taux de Succès</div>
              <div class="text-3xl font-bold text-blue-400 mt-1">{{ stats()?.successRate | number:'1.1-1' }}%</div>
            </div>
            <svg class="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a routerLink="/auditor/audit-logs"
           class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-primary transition-colors group">
          <svg class="w-10 h-10 mb-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <h3 class="text-lg font-semibold text-white group-hover:text-primary">Voir tous les logs</h3>
          <p class="text-sm text-neutral-400 mt-1">Parcourir et filtrer les logs d'audit</p>
        </a>

        <a href="http://localhost:3001" target="_blank"
           class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-orange-500 transition-colors group">
          <svg class="w-10 h-10 mb-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
          <h3 class="text-lg font-semibold text-white group-hover:text-orange-500">Grafana</h3>
          <p class="text-sm text-neutral-400 mt-1">Dashboards et visualisations</p>
        </a>

        <a href="http://localhost:9090" target="_blank"
           class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-blue-500 transition-colors group">
          <svg class="w-10 h-10 mb-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <h3 class="text-lg font-semibold text-white group-hover:text-blue-500">Prometheus</h3>
          <p class="text-sm text-neutral-400 mt-1">Métriques et alertes</p>
        </a>
      </div>

      <!-- Recent Logs Preview -->
      <div class="bg-neutral-800 rounded-lg border border-neutral-700">
        <div class="p-4 border-b border-neutral-700 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-white">Activité Récente</h2>
          <a routerLink="/auditor/audit-logs" class="text-sm text-primary hover:underline">Voir tout</a>
        </div>
        <div class="divide-y divide-neutral-700">
          <div *ngFor="let log of recentLogs()" class="p-4 hover:bg-neutral-700/30">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-white font-medium">{{ log.action }}</span>
                <span class="text-neutral-400 mx-2">-</span>
                <span class="text-neutral-400">{{ log.entityType }}</span>
              </div>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    [class.bg-green-900/50]="log.status === 'SUCCESS'"
                    [class.text-green-400]="log.status === 'SUCCESS'"
                    [class.bg-red-900/50]="log.status === 'FAILED'"
                    [class.text-red-400]="log.status === 'FAILED'">
                {{ log.status }}
              </span>
            </div>
            <div class="text-sm text-neutral-500 mt-1">
              {{ log.userEmail }} - {{ formatDate(log.actionDate) }}
            </div>
          </div>
          <div *ngIf="recentLogs().length === 0" class="p-8 text-center text-neutral-500">
            Aucune activité récente
          </div>
        </div>
      </div>

      <!-- Monitoring Info -->
      <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <h3 class="text-blue-400 font-semibold">Accès Monitoring</h3>
        </div>
        <p class="text-sm text-neutral-300">
          Pour une surveillance avancée des logs techniques, accédez à Grafana (port 3001) avec les dashboards préconfigurés.
          Prometheus (port 9090) fournit les métriques brutes et les alertes.
        </p>
      </div>
    </div>
  `
})
export class AuditorDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  stats = signal<any>(null);
  recentLogs = signal<any[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load stats
    this.apiService.getAuditStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err)
    });

    // Load recent logs
    this.apiService.getAuditLogs(0, 5).subscribe({
      next: (data) => this.recentLogs.set(data.content || []),
      error: (err) => console.error('Error loading logs:', err)
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
