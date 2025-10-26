import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">📋 Gestion des Tables</h1>
          <p class="text-neutral-400">Créez, modifiez et gérez vos tables de restaurant</p>
        </div>
        <div class="flex gap-2">
          <button 
            (click)="openCreateModal()"
            class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            ➕ Nouvelle Table
          </button>
          <button 
            (click)="exportCSV()"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
            📥 Export CSV
          </button>
          <label class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
            📤 Import CSV
            <input type="file" accept=".csv" (change)="importCSV($event)" hidden>
          </label>
          <button 
            (click)="bulkGenerateQrCodes()"
            [disabled]="tables().length === 0 || isGeneratingBulk()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            🎯 Générer QR (tous)
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <p class="text-neutral-400 text-sm">Total tables</p>
          <p class="text-3xl font-bold text-white">{{ tables().length }}</p>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <p class="text-neutral-400 text-sm">Disponibles</p>
          <p class="text-3xl font-bold text-green-400">{{ getCountByStatus('AVAILABLE') }}</p>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <p class="text-neutral-400 text-sm">Occupées</p>
          <p class="text-3xl font-bold text-red-400">{{ getCountByStatus('OCCUPIED') }}</p>
        </div>
        <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <p class="text-neutral-400 text-sm">Réservées</p>
          <p class="text-3xl font-bold text-yellow-400">{{ getCountByStatus('RESERVED') }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- Tables Grid -->
      <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div *ngFor="let table of tables()" class="bg-neutral-800 rounded-lg p-5 border border-neutral-700 hover:border-orange-500 transition">
          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-bold text-white">{{ table.number }}</h3>
              <p class="text-xs text-neutral-400">{{ table.room || 'Salle non définie' }} {{ table.name ? '- ' + table.name : '' }}</p>
            </div>
            <span [ngClass]="getStatusBadgeClass(table.status)" class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              {{ getStatusLabel(table.status) }}
            </span>
          </div>

          <!-- Capacity -->
          <p class="text-sm text-neutral-400 mb-4">👥 Capacité: <span class="text-white font-semibold">{{ table.capacity }} places</span></p>

          <!-- QR Code Display -->
          <div class="bg-neutral-700 border-2 border-dashed border-neutral-600 rounded-lg p-3 flex flex-col items-center justify-center mb-3">
            <div *ngIf="!table.qrCodeUrl" class="text-center">
              <div class="text-4xl mb-2">📱</div>
              <p class="text-xs text-neutral-400">QR Code à générer</p>
            </div>
            <div *ngIf="table.qrCodeUrl" class="text-center w-full">
              <a 
                [routerLink]="['/menu']"
                [queryParams]="{ table: table.publicId }"
                target="_blank"
                class="block">
                <img [src]="getQrCodeUrl(table.qrCodeUrl)" alt="QR Code" class="w-32 h-32 mx-auto mb-2 bg-white p-1 rounded hover:ring-2 hover:ring-primary cursor-pointer transition-all">
              </a>
              <div class="text-xs text-green-400 mb-1 font-semibold">✅ QR Code généré</div>
              <div class="text-xs text-neutral-400 break-all px-2">
                <a 
                  [routerLink]="['/menu']"
                  [queryParams]="{ table: table.publicId }"
                  target="_blank"
                  class="text-primary hover:text-primary-light underline cursor-pointer">
                  {{ getMenuUrl(table.publicId) }}
                </a>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-1 justify-center">
            <button 
              (click)="editTable(table)"
              class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center"
              title="Modifier">
              ✏️
            </button>
            <button 
              (click)="generateQrCode(table)"
              [disabled]="table.generatingQr"
              class="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm transition-colors flex items-center justify-center"
              title="Générer QR Code">
              {{ table.generatingQr ? '⏳' : '🎯' }}
            </button>
            <button 
              (click)="downloadQrCode(table)"
              [disabled]="!table.qrCodeUrl"
              class="w-8 h-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-sm transition-colors flex items-center justify-center"
              title="Télécharger QR Code">
              📥
            </button>
            <button 
              (click)="deleteTable(table)"
              class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center justify-center"
              title="Supprimer">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 max-w-md w-full border border-neutral-700 max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-white mb-4">{{ editingTable ? '✏️ Modifier Table' : '➕ Nouvelle Table' }}</h2>
          
          <form [formGroup]="tableForm" (ngSubmit)="saveTable()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Numéro de Table *</label>
              <input 
                formControlName="number"
                type="text" 
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="Ex: T01">
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Nom</label>
              <input 
                formControlName="name"
                type="text" 
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="Ex: Table Terrasse">
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Salle *</label>
              <input 
                formControlName="room"
                type="text" 
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="Ex: Salle A, Terrasse">
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Capacité (places) *</label>
              <input 
                formControlName="capacity"
                type="number" 
                min="1"
                max="20"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="4">
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Type</label>
              <select formControlName="isVip" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-orange-500">
                <option [value]="false">Standard</option>
                <option [value]="true">VIP</option>
              </select>
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="closeModal()" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button type="submit" [disabled]="!tableForm.valid || isSaving()" class="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="success()" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold">
        ✅ {{ success() }}
      </div>
      <div *ngIf="error()" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold">
        ❌ {{ error() }}
      </div>
    </div>
  `,
  styles: []
})
export class TablesComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  tables = signal<any[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isGeneratingBulk = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  
  showModal = false;
  editingTable: any = null;
  tableForm: FormGroup;

  constructor() {
    this.tableForm = this.fb.group({
      number: ['', Validators.required],
      name: [''],
      room: ['', Validators.required],
      capacity: [4, [Validators.required, Validators.min(1)]],
      isVip: [false],
      available: [true]
    });
  }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.isLoading.set(true);
    this.apiService.getTables().subscribe({
      next: (response: any) => {
        const tablesList = response.content || response.data || response;
        this.tables.set(Array.isArray(tablesList) ? tablesList : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des tables');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingTable = null;
    this.tableForm.reset({ isVip: false, capacity: 4 });
    this.showModal = true;
  }

  editTable(table: any): void {
    this.editingTable = table;
    this.tableForm.patchValue({
      number: table.number,
      name: table.name,
      room: table.room,
      capacity: table.capacity,
      isVip: table.isVip || false,
      available: table.available !== false
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTable = null;
    this.tableForm.reset({ isVip: false, capacity: 4 });
  }

  saveTable(): void {
    if (!this.tableForm.valid) return;
    this.isSaving.set(true);

    const data = this.tableForm.value;

    if (this.editingTable) {
      this.apiService.updateTable(this.editingTable.publicId, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.success.set('Table modifiée avec succès');
          this.closeModal();
          this.loadTables();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err.error?.message || err.error?.error || 'Erreur lors de la modification';
          this.error.set(errorMsg);
          console.error('Update error:', err);
          setTimeout(() => this.error.set(null), 3000);
        }
      });
    } else {
      this.apiService.createTable(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.success.set('Table créée avec succès');
          this.closeModal();
          this.loadTables();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err.error?.message || err.error?.error || 'Erreur lors de la création';
          this.error.set(errorMsg);
          console.error('Create error:', err);
          setTimeout(() => this.error.set(null), 3000);
        }
      });
    }
  }

  deleteTable(table: any): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la table "${table.name}"?`)) return;
    
    this.apiService.deleteTable(table.publicId).subscribe({
      next: () => {
        this.success.set('Table supprimée');
        this.loadTables();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.error.set('Erreur lors de la suppression');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  generateQrCode(table: any): void {
    table.generatingQr = true;
    this.apiService.generateTableQrCode(table.publicId).subscribe({
      next: () => {
        table.generatingQr = false;
        this.success.set('QR code généré');
        this.loadTables();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        table.generatingQr = false;
        this.error.set('Erreur génération QR');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  downloadQrCode(table: any): void {
    if (!table.qrCodeUrl) {
      this.error.set('QR code non disponible');
      setTimeout(() => this.error.set(null), 3000);
      return;
    }

    const qrCodeUrl = this.getQrCodeUrl(table.qrCodeUrl);
    
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${table.number}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.success.set('QR code téléchargé');
        setTimeout(() => this.success.set(null), 2000);
      })
      .catch(error => {
        console.error('Erreur téléchargement QR code:', error);
        this.error.set('Erreur lors du téléchargement');
        setTimeout(() => this.error.set(null), 3000);
      });
  }

  bulkGenerateQrCodes(): void {
    const tableIds = this.tables().map(t => t.publicId);
    if (tableIds.length === 0) {
      this.error.set('Aucune table à générer');
      return;
    }

    if (!confirm(`Générer les QR codes pour ${tableIds.length} table(s)?`)) return;

    this.isGeneratingBulk.set(true);
    this.apiService.generateBulkTableQrCodes(tableIds).subscribe({
      next: () => {
        this.isGeneratingBulk.set(false);
        this.success.set(`${tableIds.length} QR codes générés`);
        this.loadTables();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.isGeneratingBulk.set(false);
        this.error.set('Erreur génération QR');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  exportCSV(): void {
    const headers = ['Nom', 'Localisation', 'Capacité', 'Type', 'Statut'];
    const rows = this.tables().map(t => [
      t.name,
      t.location || '',
      t.capacity,
      t.isVip ? 'VIP' : 'Standard',
      this.getStatusLabel(t.status)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tables-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    this.success.set('CSV exporté');
    setTimeout(() => this.success.set(null), 3000);
  }

  importCSV(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter((line: string) => line.trim());
        if (lines.length < 2) {
          this.error.set('Fichier CSV invalide');
          return;
        }

        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
          
          const data = {
            name: values[headers.indexOf('nom')] || `Table ${i}`,
            location: values[headers.indexOf('localisation')] || '',
            capacity: parseInt(values[headers.indexOf('capacité')] || '4') || 4,
            isVip: (values[headers.indexOf('type')] || '').toLowerCase() === 'vip'
          };

          this.apiService.createTable(data).subscribe({
            next: () => {
              imported++;
              if (imported === lines.length - 1) {
                this.success.set(`${imported} tables importées`);
                this.loadTables();
                setTimeout(() => this.success.set(null), 3000);
              }
            }
          });
        }
      } catch (err) {
        this.error.set('Erreur lors de l\'importation');
        setTimeout(() => this.error.set(null), 3000);
      }
    };
    reader.readAsText(file);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': '✅ Disponible',
      'OCCUPIED': '🔴 Occupée',
      'RESERVED': '🟡 Réservée'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'AVAILABLE': 'bg-green-900/30 text-green-300 border border-green-600',
      'OCCUPIED': 'bg-red-900/30 text-red-300 border border-red-600',
      'RESERVED': 'bg-yellow-900/30 text-yellow-300 border border-yellow-600'
    };
    return classes[status] || 'bg-neutral-700 text-neutral-300';
  }

  getCountByStatus(status: string): number {
    return this.tables().filter(t => t.status === status).length;
  }

  getQrCodeUrl(qrCodeUrl: string): string {
    if (!qrCodeUrl) return '';
    if (qrCodeUrl.startsWith('http')) return qrCodeUrl;
    return `http://localhost:8080${qrCodeUrl}`;
  }

  getMenuUrl(tablePublicId: string): string {
    return `${window.location.origin}/menu?table=${tablePublicId}`;
  }

  getQrMenuUrl(tablePublicId: string): string {
    return `${window.location.origin}/menu?table=${tablePublicId}`;
  }

  openQrMenu(table: any): void {
    this.router.navigate(['/menu'], { 
      queryParams: { table: table.publicId } 
    });
  }
}
