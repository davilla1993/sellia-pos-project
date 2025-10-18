import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Gestion des Utilisateurs</h1>
          <p class="text-neutral-400">Créez et gérez les comptes de votre équipe</p>
        </div>
        <a routerLink="add" class="btn-primary">+ Nouvel Utilisateur</a>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
        {{ error() }}
      </div>

      <!-- Users Table -->
      <div *ngIf="!isLoading() && users().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table class="w-full">
          <thead class="bg-neutral-700 border-b border-neutral-600">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Nom</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Rôle</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Statut</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of paginatedUsers()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
              <td class="px-6 py-4 text-white">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="px-6 py-4 text-neutral-300">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium" 
                  [class]="getRoleClass(user.role)">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                  [class]="user.active ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'">
                  {{ user.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 space-x-2 flex">
                <a [routerLink]="[user.publicId, 'edit']" class="text-primary hover:text-primary-dark text-sm font-medium">Éditer</a>
                <button *ngIf="user.active" (click)="deactivateUser(user.publicId)" class="text-red-400 hover:text-red-300 text-sm font-medium">Désactiver</button>
                <button *ngIf="!user.active" (click)="activateUser(user.publicId)" class="text-green-400 hover:text-green-300 text-sm font-medium">Activer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div *ngIf="!isLoading() && users().length > 0" class="flex justify-center items-center gap-3 bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <button (click)="previousPage()" [disabled]="currentPage() === 1" class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-300 rounded font-medium">
          ← Précédent
        </button>
        <div class="flex gap-1">
          <button *ngFor="let page of getPageNumbers()" 
            (click)="goToPage(page)"
            [class.bg-primary]="currentPage() === page"
            [class.bg-neutral-700]="currentPage() !== page"
            [class.text-white]="currentPage() === page"
            [class.text-neutral-300]="currentPage() !== page"
            class="w-8 h-8 rounded font-semibold transition-colors text-sm">
            {{ page }}
          </button>
        </div>
        <button (click)="nextPage()" [disabled]="currentPage() === totalPages()" class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-300 rounded font-medium">
          Suivant →
        </button>
        <span class="text-neutral-400 text-sm ml-2">{{ currentPage() }} / {{ totalPages() }} ({{ users().length }} utilisateurs)</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && users().length === 0" class="text-center py-12">
        <p class="text-neutral-400 mb-4">Aucun utilisateur trouvé</p>
        <a routerLink="add" class="text-primary hover:text-primary-dark font-medium">Créer le premier utilisateur</a>
      </div>
    </div>
  `,
  styles: []
})
export class UsersListComponent implements OnInit {
  private apiService = inject(ApiService);

  users = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  itemsPerPage = 10;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiService.getUsers(0, 50).subscribe({
      next: (data) => {
        this.users.set(Array.isArray(data) ? data : data.content || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des utilisateurs');
        this.isLoading.set(false);
      }
    });
  }

  deactivateUser(publicId: string): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur?')) {
      this.apiService.deactivateUser(publicId).subscribe({
        next: () => this.loadUsers(),
        error: () => this.error.set('Erreur lors de la désactivation')
      });
    }
  }

  activateUser(publicId: string): void {
    if (confirm('Êtes-vous sûr de vouloir activer cet utilisateur?')) {
      this.apiService.activateUser(publicId).subscribe({
        next: () => this.loadUsers(),
        error: () => this.error.set('Erreur lors de l\'activation')
      });
    }
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'CAISSE': 'Caissier',
      'CUISINE': 'Cuisinier'
    };
    return labels[role] || role;
  }

  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      'ADMIN': 'bg-purple-900/30 text-purple-300',
      'CAISSE': 'bg-blue-900/30 text-blue-300',
      'CUISINE': 'bg-orange-900/30 text-orange-300'
    };
    return classes[role] || 'bg-gray-900/30 text-gray-300';
  }

  totalPages(): number {
    return Math.ceil(this.users().length / this.itemsPerPage);
  }

  paginatedUsers() {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.users().slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, current + 2);
    
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(total, 5);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
