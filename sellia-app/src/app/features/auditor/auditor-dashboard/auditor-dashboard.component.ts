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
            <div class="text-4xl">&#128466;</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Actions Réussies</div>
              <div class="text-3xl font-bold text-green-400 mt-1">{{ stats()?.successLogs | number }}</div>
            </div>
            <div class="text-4xl">&#9989;</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Erreurs</div>
              <div class="text-3xl font-bold text-red-400 mt-1">{{ stats()?.failedLogs | number }}</div>
            </div>
            <div class="text-4xl">&#10060;</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-neutral-400 text-sm">Taux de Succès</div>
              <div class="text-3xl font-bold text-blue-400 mt-1">{{ stats()?.successRate | number:'1.1-1' }}%</div>
            </div>
            <div class="text-4xl">&#128200;</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a routerLink="/auditor/audit-logs"
           class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-primary transition-colors group">
          <div class="text-3xl mb-3">&#128466;</div>
          <h3 class="text-lg font-semibold text-white group-hover:text-primary">Voir tous les logs</h3>
          <p class="text-sm text-neutral-400 mt-1">Parcourir et filtrer les logs d'audit</p>
        </a>

        <a href="http://localhost:3001" target="_blank"
           class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-orange-500 transition-colors group">
          <div class="text-3xl mb-3">&#128200;</div>
          <h3 class="text-lg font-semibold text-white group-hover:text-orange-500">Grafana</h3>
          <p class="text-sm text-neutral-400 mt-1">Dashboards et visualisations</p>
        </a>

        <a href="http://localhost:9090" target="_blank"
           class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-blue-500 transition-colors group">
          <div class="text-3xl mb-3">&#127760;</div>
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
        <h3 class="text-blue-400 font-semibold mb-2">&#128161; Accès Monitoring</h3>
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
