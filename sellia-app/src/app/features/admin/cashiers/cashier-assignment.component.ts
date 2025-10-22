import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-cashier-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-neutral-800 border-b border-neutral-700 px-6 py-4 -mx-8 -mt-6 mb-6">
        <h1 class="text-3xl font-bold text-white">Attribution des Caisses</h1>
        <p class="text-neutral-400 text-sm mt-1">Gérez l'assignation des caissiers aux caisses</p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
        {{ error() }}
      </div>

      <!-- Success -->
      <div *ngIf="success()" class="p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-200">
        {{ success() }}
      </div>

      <!-- Caisses Grid -->
      <div *ngIf="!isLoading() && cashiers().length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div *ngFor="let cashier of cashiers()" class="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
          <!-- Caisse Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-white">{{ cashier.name }}</h2>
              <p class="text-xs text-neutral-400">{{ cashier.description || 'Pas de description' }}</p>
            </div>
            <div [class]="cashier.status === 'ACTIVE' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'" class="px-3 py-1 rounded text-xs font-semibold">
              {{ cashier.status === 'ACTIVE' ? 'Actif' : 'Inactif' }}
            </div>
          </div>

          <!-- Caissiers Assignés -->
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-neutral-300 mb-2">Caissiers assignés ({{ assignedUsers[cashier.publicId]?.length || 0 }})</h3>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              <div *ngIf="(assignedUsers[cashier.publicId]?.length || 0) === 0" class="text-xs text-neutral-500 italic">
                Aucun caissier assigné
              </div>
              <div *ngFor="let user of (assignedUsers[cashier.publicId] || [])" class="flex items-center justify-between bg-neutral-700 px-3 py-2 rounded text-sm">
                <span class="text-white">{{ user.firstName }} {{ user.lastName }}</span>
                <button 
                  (click)="removeUser(cashier.publicId, user.publicId)"
                  class="text-red-400 hover:text-red-300 font-medium text-xs">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Ajouter Caissier -->
          <div class="border-t border-neutral-600 pt-4">
            <select 
              [(ngModel)]="selectedUsers[cashier.publicId]"
              class="w-full bg-neutral-700 border border-neutral-600 text-white rounded px-3 py-2 text-sm mb-2">
              <option value="">-- Ajouter un caissier --</option>
              <option *ngFor="let user of getAvailableUsers(cashier.publicId)" [value]="user.publicId">
                {{ user.firstName }} {{ user.lastName }}
              </option>
            </select>
            <button 
              (click)="assignUser(cashier.publicId, selectedUsers[cashier.publicId])"
              [disabled]="!selectedUsers[cashier.publicId]"
              class="w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Assigner
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && cashiers().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
        <p class="text-neutral-400 mb-4">Aucune caisse trouvée</p>
      </div>
    </div>
  `,
  styles: []
})
export class CashierAssignmentComponent implements OnInit {
  private apiService = inject(ApiService);

  cashiers = signal<any[]>([]);
  allUsers = signal<any[]>([]);
  assignedUsers: { [key: string]: any[] } = {};
  selectedUsers: { [key: string]: string } = {};
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    // Charger les caisses
    this.apiService.getAllCashiers().subscribe({
      next: (data: any) => {
        const loaded = Array.isArray(data) ? data : data.content || [];
        this.cashiers.set(loaded);
        this.loadAssignedUsers();
      },
      error: () => {
        this.error.set('Erreur lors du chargement des caisses');
        this.isLoading.set(false);
      }
    });

    // Charger les utilisateurs avec le rôle CAISSE
    this.apiService.getUsersByRole('CAISSE', 0, 100).subscribe({
      next: (data: any) => {
        console.log('Users response:', data);
        let loaded: any[] = [];
        if (Array.isArray(data)) {
          loaded = data;
        } else if (data?.content && Array.isArray(data.content)) {
          loaded = data.content;
        } else if (data?.data && Array.isArray(data.data)) {
          loaded = data.data;
        }
        console.log('Loaded users:', loaded);
        this.allUsers.set(loaded);
      },
      error: (err) => {
        console.error('Error loading cashiers:', err);
        this.error.set('Erreur lors du chargement des caissiers: ' + (err?.error?.message || err?.message || 'Erreur inconnue'));
      }
    });
  }

  loadAssignedUsers(): void {
    this.cashiers().forEach(cashier => {
      // Les utilisateurs assignés sont déjà dans cashier.assignedUsers
      this.assignedUsers[cashier.publicId] = Array.isArray(cashier.assignedUsers) 
        ? cashier.assignedUsers 
        : [];
      console.log(`Cashier ${cashier.name} has ${this.assignedUsers[cashier.publicId].length} assigned users`);
    });
    this.isLoading.set(false);
  }

  getAvailableUsers(cashierId: string): any[] {
    const assigned = this.assignedUsers[cashierId] || [];
    const assignedIds = assigned.map(u => u.publicId);
    return this.allUsers().filter(u => !assignedIds.includes(u.publicId));
  }

  assignUser(cashierId: string, userId: string): void {
    if (!userId) return;

    this.apiService.assignUserToCashier(cashierId, userId).subscribe({
      next: () => {
        this.success.set('Caissier assigné avec succès');
        this.selectedUsers[cashierId] = '';
        this.loadData();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        let errorMsg = 'Erreur lors de l\'assignation';
        
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.error) {
          errorMsg = err.error.error;
        } else if (err.error?.details) {
          errorMsg = err.error.details;
        } else if (err.status === 409) {
          errorMsg = 'Ce caissier ne peut pas être assigné (peut-être déjà assigné ailleurs)';
        } else if (err.status === 404) {
          errorMsg = 'Caissier ou utilisateur non trouvé';
        } else if (err.status === 500) {
          errorMsg = 'Erreur serveur. Veuillez réessayer plus tard';
        }
        
        this.error.set(errorMsg);
        console.error('Error assigning user:', err);
      }
    });
  }

  removeUser(cashierId: string, userId: string): void {
    if (confirm('Êtes-vous sûr de vouloir retirer ce caissier?')) {
      this.apiService.removeUserFromCashier(cashierId, userId).subscribe({
        next: () => {
          this.success.set('Caissier retiré avec succès');
          this.loadAssignedUsers();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
}
