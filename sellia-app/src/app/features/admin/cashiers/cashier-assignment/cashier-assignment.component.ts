import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-cashier-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-assignment.component.html',
  styleUrls: ['./cashier-assignment.component.css']
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
          this.loadData();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
}
