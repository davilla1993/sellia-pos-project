import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditRetentionService, RetentionConfig, ArchiveResult } from '@core/services/audit-retention.service';

@Component({
  selector: 'app-retention-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Gestion de la Rétention</h1>
        <p class="text-neutral-400">Configuration et archivage des logs d'audit</p>
      </div>

      <!-- Configuration Card -->
      <div class="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04,-0.3 0.06,-0.61 0.06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c0.18,-0.14 0.23,-0.41 0.12,-0.64l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,0.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,0.17 -0.47,0.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,0.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58C4.84,11.36 4.8,11.69 4.8,12s0.02,0.64 0.07,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.64l1.92,3.32c0.12,0.22 0.37,0.29 0.59,0.22l2.39,-0.96c0.5,0.38 1.03,0.7 1.62,0.94l0.36,2.54c0.05,0.24 0.24,0.41 0.48,0.41h3.84c0.24,0 0.44,-0.17 0.47,-0.41l0.36,-2.54c0.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,0.96c0.22,0.08 0.47,0 0.59,-0.22l1.92,-3.32c0.12,-0.22 0.07,-0.5 -0.12,-0.64L19.14,12.94zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6S13.98,15.6 12,15.6z"/>
          </svg>
          <h2 class="text-xl font-semibold text-white">Configuration Actuelle</h2>
        </div>

        <div *ngIf="config(); else loadingConfig" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-neutral-700/50 rounded-lg p-4">
            <div class="text-neutral-400 text-sm mb-1">Durée de rétention</div>
            <div class="text-2xl font-bold text-white">{{ config()!.retentionDays }} jours</div>
            <div class="text-xs text-neutral-500 mt-1">Logs conservés en base de données</div>
          </div>

          <div class="bg-neutral-700/50 rounded-lg p-4">
            <div class="text-neutral-400 text-sm mb-1">Archivage</div>
            <div class="flex items-center gap-2">
              <div class="text-2xl font-bold" [class.text-green-400]="config()!.archiveEnabled" [class.text-red-400]="!config()!.archiveEnabled">
                {{ config()!.archiveEnabled ? 'Activé' : 'Désactivé' }}
              </div>
              <svg *ngIf="config()!.archiveEnabled" class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="text-xs text-neutral-500 mt-1">Export CSV avant suppression</div>
          </div>

          <div class="bg-neutral-700/50 rounded-lg p-4">
            <div class="text-neutral-400 text-sm mb-1">Emplacement archives</div>
            <div class="text-sm font-mono text-white break-all">{{ config()!.archivePath }}</div>
            <div class="text-xs text-neutral-500 mt-1">Dossier de stockage</div>
          </div>
        </div>

        <ng-template #loadingConfig>
          <div class="text-center py-8 text-neutral-400">
            Chargement de la configuration...
          </div>
        </ng-template>
      </div>

      <!-- Archive Action Card -->
      <div class="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z"/>
          </svg>
          <h2 class="text-xl font-semibold text-white">Archivage Manuel</h2>
        </div>

        <div class="space-y-4">
          <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <div class="text-sm text-blue-200">
                <p class="font-semibold mb-1">Information</p>
                <p>L'archivage manuel permet d'exporter et supprimer immédiatement les logs plus anciens que {{ config()?.retentionDays || 90 }} jours. Cette opération est normalement effectuée automatiquement tous les dimanches à 3h du matin.</p>
              </div>
            </div>
          </div>

          <!-- Archive Result -->
          <div *ngIf="archiveResult()" class="rounded-lg p-4 border" [class.bg-green-900/20]="archiveResult()!.success" [class.border-green-700]="archiveResult()!.success" [class.bg-red-900/20]="!archiveResult()!.success" [class.border-red-700]="!archiveResult()!.success">
            <div class="flex items-start gap-3">
              <svg *ngIf="archiveResult()!.success" class="w-6 h-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <svg *ngIf="!archiveResult()!.success" class="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
              <div class="flex-1">
                <p class="font-semibold mb-2" [class.text-green-400]="archiveResult()!.success" [class.text-red-400]="!archiveResult()!.success">
                  {{ archiveResult()!.message }}
                </p>
                <div *ngIf="archiveResult()!.success" class="space-y-1 text-sm text-neutral-300">
                  <p><span class="font-medium">Logs archivés :</span> {{ archiveResult()!.archivedCount }}</p>
                  <p><span class="font-medium">Logs supprimés :</span> {{ archiveResult()!.deletedCount }}</p>
                  <p *ngIf="archiveResult()!.archiveFile" class="font-mono text-xs bg-neutral-900/50 p-2 rounded mt-2">
                    {{ archiveResult()!.archiveFile }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Archive Button -->
          <button (click)="triggerArchive()" [disabled]="isArchiving()" class="w-full md:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg *ngIf="!isArchiving()" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z"/>
            </svg>
            <svg *ngIf="isArchiving()" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isArchiving() ? 'Archivage en cours...' : 'Archiver maintenant' }}</span>
          </button>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
          </svg>
          <div class="flex-1">
            <h3 class="text-white font-semibold mb-2">À propos de la rétention des logs</h3>
            <div class="text-sm text-neutral-300 space-y-2">
              <p>Les logs d'audit sont automatiquement archivés et supprimés pour maintenir des performances optimales de la base de données.</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li>Archivage automatique tous les dimanches à 3h du matin</li>
                <li>Export en fichier CSV avant suppression</li>
                <li>Logs toujours disponibles dans Grafana/Loki pour analyse</li>
                <li>Les archives CSV peuvent être ré-importées si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RetentionManagementComponent implements OnInit {
  private retentionService = inject(AuditRetentionService);

  config = signal<RetentionConfig | null>(null);
  archiveResult = signal<ArchiveResult | null>(null);
  isArchiving = signal(false);

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.retentionService.getConfig().subscribe({
      next: (data) => this.config.set(data),
      error: (err) => console.error('Error loading retention config:', err)
    });
  }

  triggerArchive(): void {
    if (this.isArchiving()) return;

    this.isArchiving.set(true);
    this.archiveResult.set(null);

    this.retentionService.archiveNow().subscribe({
      next: (result) => {
        this.archiveResult.set(result);
        this.isArchiving.set(false);
      },
      error: (err) => {
        console.error('Error archiving logs:', err);
        this.archiveResult.set({
          success: false,
          message: 'Erreur lors de l\'archivage: ' + (err.error?.message || err.message),
          archivedCount: 0,
          deletedCount: 0,
          archiveFile: ''
        });
        this.isArchiving.set(false);
      }
    });
  }
}
