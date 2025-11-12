import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-search-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-invoice.component.html',
  styleUrls: ['./search-invoice.component.css']
})
export class SearchInvoiceComponent {
  invoiceNumber = '';
  searchResults = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searched = signal(false);

  constructor(private apiService: ApiService) {}

  searchInvoice(): void {
    if (!this.invoiceNumber.trim()) {
      this.error.set('Veuillez entrer un numéro de facture');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.searched.set(true);

    // Ajouter le préfixe INV- si l'utilisateur ne l'a pas mis
    let searchNumber = this.invoiceNumber.trim();
    if (!searchNumber.toUpperCase().startsWith('INV-')) {
      searchNumber = 'INV-' + searchNumber;
    }

    this.apiService.searchOrdersByInvoice(searchNumber).subscribe({
      next: (orders) => {
        this.searchResults.set(orders);
        this.loading.set(false);
        if (orders.length === 0) {
          this.error.set('Aucune commande trouvée pour cette facture');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Facture non trouvée');
        this.searchResults.set([]);
      }
    });
  }

  clearSearch(): void {
    this.invoiceNumber = '';
    this.searchResults.set([]);
    this.error.set(null);
    this.searched.set(false);
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '0 FCFA';
    const formatted = Math.round(value).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  formatDateTime(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'EN_ATTENTE': 'bg-yellow-500/20 text-yellow-400',
      'EN_PREPARATION': 'bg-blue-500/20 text-blue-400',
      'PRET': 'bg-green-500/20 text-green-400',
      'SERVI': 'bg-purple-500/20 text-purple-400',
      'ANNULE': 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_PREPARATION': 'En préparation',
      'PRET': 'Prêt',
      'SERVI': 'Servi',
      'ANNULE': 'Annulé'
    };
    return labels[status] || status;
  }

  getTotalAmount(): number {
    return this.searchResults().reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }

  getTotalDiscounts(): number {
    return this.searchResults().reduce((sum, order) => sum + (order.discountAmount || 0), 0);
  }
}
