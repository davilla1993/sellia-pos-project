import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

interface RestaurantTable {
  publicId: string;
  number: number;
  name: string;
  location: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  qrCode?: string;
  qrCodeUrl?: string;
  orderUrl?: string;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Gestion des QR Codes</h1>
          <p class="text-neutral-400">Gérez les QR codes pour chaque table</p>
        </div>
        <button class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
          + Nouvelle table
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Total tables</p>
              <p class="text-3xl font-bold text-white">{{ tables().length }}</p>
            </div>
            <div class="text-4xl opacity-30">📱</div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Disponibles</p>
              <p class="text-3xl font-bold text-green-500">{{ getTablesByStatus('AVAILABLE').length }}</p>
            </div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Occupées</p>
              <p class="text-3xl font-bold text-red-500">{{ getTablesByStatus('OCCUPIED').length }}</p>
            </div>
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>

        <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Réservées</p>
              <p class="text-3xl font-bold text-yellow-500">{{ getTablesByStatus('RESERVED').length }}</p>
            </div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Tables Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let table of getPaginatedTables()" class="bg-neutral-800 rounded-lg p-5 border border-neutral-700 hover:border-neutral-600 transition flex flex-col">
          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div class="min-w-0">
              <h3 class="text-sm font-bold text-white truncate">{{ table.name }}</h3>
              <p class="text-xs text-neutral-400 truncate">{{ table.location }}</p>
            </div>
            <span [ngClass]="getStatusBadgeClass(table.status)" class="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0">
              {{ getStatusLabel(table.status) }}
            </span>
          </div>

          <!-- Capacity -->
          <p class="text-xs text-neutral-400 mb-3">{{ table.capacity }} places</p>

          <!-- QR Code Placeholder -->
          <div class="bg-neutral-700 border-2 border-dashed border-neutral-600 rounded-lg p-4 flex items-center justify-center mb-2 h-24">
            <div class="text-center">
              <div class="text-3xl">📱</div>
            </div>
          </div>

          <!-- Order URL -->
          <p class="text-xs text-neutral-500 mb-1">URL:</p>
          <p class="text-xs text-neutral-400 bg-neutral-700 p-1.5 rounded mb-3 break-all">{{ table.orderUrl }}</p>

          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              (click)="generateQrCode(table.publicId)"
              [disabled]="table.qrCodeUrl"
              class="flex-1 px-2 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors">
              {{ table.qrCodeUrl ? '✓ Généré' : '🎯 Générer' }}
            </button>
            <button class="flex-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors">
              👁️ Prévisualiser
            </button>
            <button class="px-2 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-400 rounded transition-colors">
              ✏️
            </button>
            <button class="px-2 py-2 bg-red-700 hover:bg-red-800 text-white rounded transition-colors">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center gap-2 mt-8">
        <button 
          (click)="previousPage()"
          [disabled]="currentPage() === 1"
          class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white rounded-lg transition-colors">
          ← Précédent
        </button>
        
        <div class="flex gap-2">
          <button 
            *ngFor="let page of getPageNumbers()"
            (click)="goToPage(page)"
            [class.bg-orange-500]="currentPage() === page"
            [class.bg-neutral-700]="currentPage() !== page"
            class="px-3 py-2 rounded-lg text-white transition-colors">
            {{ page }}
          </button>
        </div>

        <button 
          (click)="nextPage()"
          [disabled]="currentPage() === getTotalPages()"
          class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white rounded-lg transition-colors">
          Suivant →
        </button>
      </div>
    </div>
  `
})
export class TablesComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  tables = signal<RestaurantTable[]>([]);
  currentPage = signal(1);
  readonly ITEMS_PER_PAGE = 6;

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.apiService.getTables().subscribe({
      next: (response: any) => {
        const tablesList = Array.isArray(response) ? response : [];
        this.tables.set(tablesList);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toast.error('Erreur lors du chargement des tables');
      }
    });
  }

  getPaginatedTables(): RestaurantTable[] {
    const start = (this.currentPage() - 1) * this.ITEMS_PER_PAGE;
    const end = start + this.ITEMS_PER_PAGE;
    return this.tables().slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.tables().length / this.ITEMS_PER_PAGE);
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.getTotalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  getTablesByStatus(status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'): RestaurantTable[] {
    return this.tables().filter(t => t.status === status);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': 'Disponible',
      'OCCUPIED': 'Occupée',
      'RESERVED': 'Réservée'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'AVAILABLE': 'bg-green-100 text-green-800',
      'OCCUPIED': 'bg-red-100 text-red-800',
      'RESERVED': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-neutral-700 text-neutral-300';
  }

  generateQrCode(tablePublicId: string): void {
    this.apiService.generateTableQrCode(tablePublicId).subscribe({
      next: () => {
        this.toast.success('QR code généré avec succès');
        this.loadTables();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toast.error('Erreur lors de la génération du QR code');
      }
    });
  }
}
