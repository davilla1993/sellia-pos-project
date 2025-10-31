import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
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
