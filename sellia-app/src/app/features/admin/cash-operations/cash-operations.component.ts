import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashOperationService, CashOperation } from '@core/services/cash-operation.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-cash-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-operations.component.html',
  styleUrls: ['./cash-operations.component.css']
})
export class CashOperationsComponent implements OnInit {
  private cashOperationService = inject(CashOperationService);
  private toast = inject(ToastService);

  operations = signal<CashOperation[]>([]);
  isLoading = signal(false);
  currentPage = signal(0);
  pageSize = signal(20);
  totalElements = signal(0);
  totalPages = signal(0);

  // Filters
  startDate = '';
  endDate = '';

  // Selected operation for notes
  selectedOperation = signal<CashOperation | null>(null);
  showNotesModal = signal(false);
  adminNotes = '';
  savingNotes = signal(false);

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    this.loadOperations();
  }

  loadOperations(): void {
    this.isLoading.set(true);

    const start = this.startDate ? new Date(this.startDate).toISOString() : '';
    const end = this.endDate ? new Date(this.endDate + 'T23:59:59').toISOString() : '';

    if (start && end) {
      this.cashOperationService.getOperationsByDateRange(start, end, this.currentPage(), this.pageSize()).subscribe({
        next: (response: any) => {
          const ops = response.content || response.data || response || [];
          this.operations.set(Array.isArray(ops) ? ops : []);
          this.totalElements.set(response.totalElements || 0);
          this.totalPages.set(response.totalPages || 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('Erreur lors du chargement des opérations');
        }
      });
    } else {
      this.cashOperationService.getAllOperations(this.currentPage(), this.pageSize()).subscribe({
        next: (response: any) => {
          const ops = response.content || response.data || response || [];
          this.operations.set(Array.isArray(ops) ? ops : []);
          this.totalElements.set(response.totalElements || 0);
          this.totalPages.set(response.totalPages || 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('Erreur lors du chargement des opérations');
        }
      });
    }
  }

  applyFilters(): void {
    this.currentPage.set(0);
    this.loadOperations();
  }

  clearFilters(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.currentPage.set(0);
    this.loadOperations();
  }

  openNotesModal(operation: CashOperation): void {
    this.selectedOperation.set(operation);
    this.adminNotes = operation.adminNotes || '';
    this.showNotesModal.set(true);
  }

  closeNotesModal(): void {
    this.showNotesModal.set(false);
    this.selectedOperation.set(null);
    this.adminNotes = '';
  }

  saveNotes(): void {
    const operation = this.selectedOperation();
    if (!operation) return;

    this.savingNotes.set(true);
    this.cashOperationService.updateAdminNotes(operation.publicId, this.adminNotes).subscribe({
      next: () => {
        this.toast.success('Notes enregistrées');
        this.savingNotes.set(false);
        this.closeNotesModal();
        this.loadOperations();
      },
      error: () => {
        this.savingNotes.set(false);
        this.toast.error('Erreur lors de l\'enregistrement');
      }
    });
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadOperations();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadOperations();
    }
  }

  getTotalEntrees(): number {
    return this.operations()
      .filter(op => op.type === 'ENTREE')
      .reduce((sum, op) => sum + op.amount, 0);
  }

  getTotalSorties(): number {
    return this.operations()
      .filter(op => op.type === 'SORTIE')
      .reduce((sum, op) => sum + op.amount, 0);
  }

  getEntreesCount(): number {
    return this.operations().filter(op => op.type === 'ENTREE').length;
  }

  getSortiesCount(): number {
    return this.operations().filter(op => op.type === 'SORTIE').length;
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
