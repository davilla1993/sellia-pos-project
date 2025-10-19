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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div *ngFor="let table of tables()" class="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition">
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-white">{{ table.name }}</h3>
              <p class="text-sm text-neutral-400">{{ table.location }}</p>
            </div>
            <span [ngClass]="getStatusBadgeClass(table.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
              {{ getStatusLabel(table.status) }}
            </span>
          </div>

          <!-- Capacity -->
          <p class="text-sm text-neutral-400 mb-4">{{ table.capacity }} places</p>

          <!-- QR Code Placeholder -->
          <div class="bg-neutral-700 border-2 border-dashed border-neutral-600 rounded-lg p-8 flex items-center justify-center mb-4 h-32">
            <div class="text-center">
              <div class="text-3xl mb-2">📱</div>
              <p class="text-xs text-neutral-500">QR Code</p>
            </div>
          </div>

          <!-- Order URL -->
          <p class="text-xs text-neutral-500 mb-2">URL de commande:</p>
          <p class="text-xs text-neutral-400 bg-neutral-700 p-2 rounded mb-4 truncate">{{ table.orderUrl }}</p>

          <!-- Actions -->
          <div class="flex gap-2">
            <button class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-orange-500 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <span>⬇️</span> Télécharger
            </button>
            <button class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-blue-500 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <span>👁️</span> Prévisualiser
            </button>
            <button class="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-400 rounded text-sm transition-colors">
              ✏️
            </button>
            <button class="px-3 py-2 bg-neutral-700 hover:bg-red-700 text-neutral-400 hover:text-red-400 rounded text-sm transition-colors">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TablesComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  tables = signal<RestaurantTable[]>([]);

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    const mockTables: RestaurantTable[] = [
      {
        publicId: '1',
        number: 1,
        name: 'Table 1',
        location: 'Table Terrasse 1',
        capacity: 4,
        status: 'AVAILABLE',
        orderUrl: 'https://application-de-gesti-zdmm.bolt.host/menu?table=1'
      },
      {
        publicId: '2',
        number: 2,
        name: 'Table 2',
        location: 'Table Terrasse 2',
        capacity: 4,
        status: 'OCCUPIED',
        orderUrl: 'https://application-de-gesti-zdmm.bolt.host/menu?table=2'
      },
      {
        publicId: '3',
        number: 3,
        name: 'Table 3',
        location: 'Table Intérieur 1',
        capacity: 2,
        status: 'AVAILABLE',
        orderUrl: 'https://application-de-gesti-zdmm.bolt.host/menu?table=3'
      },
      {
        publicId: '4',
        number: 4,
        name: 'Table 4',
        location: 'Table Bar 1',
        capacity: 2,
        status: 'RESERVED',
        orderUrl: 'https://application-de-gesti-zdmm.bolt.host/menu?table=4'
      },
      {
        publicId: '5',
        number: 5,
        name: 'Table 5',
        location: 'Table VIP 1',
        capacity: 6,
        status: 'AVAILABLE',
        orderUrl: 'https://application-de-gesti-zdmm.bolt.host/menu?table=5'
      }
    ];
    this.tables.set(mockTables);
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
}
