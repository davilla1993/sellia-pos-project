import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalSessionService } from '@core/services/global-session.service';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-global-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">
      <h1>Gestion Session Globale</h1>

      <div class="status-panel">
        <div *ngIf="currentSession" class="session-info">
          <h2>Session Active</h2>
          <p>Statut: <strong [class.open]="currentSession.status === 'OPEN'" [class.closed]="currentSession.status === 'CLOSED'">
            {{ currentSession.status }}
          </strong></p>
          <p>Ouvert par: {{ currentSession.openedBy?.firstName }} {{ currentSession.openedBy?.lastName }}</p>
          <p>Depuis: {{ currentSession.openedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
          <p>Ventes: {{ formatCurrency(currentSession.totalSales) }}</p>
          <button *ngIf="currentSession.status === 'OPEN'" (click)="openCloseModal()" class="btn btn-danger">
            🔒 Fermer Session
          </button>
        </div>

        <div *ngIf="!currentSession" class="no-session">
          <p>Aucune session active</p>
          <button (click)="openOpenModal()" class="btn btn-primary">
            🔓 Ouvrir Session
          </button>
        </div>
      </div>

      <!-- Open Modal -->
      <div *ngIf="showOpenModal" class="modal">
        <div class="modal-content">
          <h2>Ouvrir Nouvelle Session</h2>
          <div class="form-group">
            <label>Montant Initial</label>
            <input type="number" [(ngModel)]="initialAmount" placeholder="0">
          </div>
          <div class="modal-actions">
            <button (click)="closeModal()" class="btn btn-secondary">Annuler</button>
            <button (click)="openSession()" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Ouverture...' : 'Ouvrir' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Close Modal -->
      <div *ngIf="showCloseModal" class="modal">
        <div class="modal-content">
          <h2>Fermer Session</h2>
          <div class="form-group">
            <label>Montant Final</label>
            <input type="number" [(ngModel)]="finalAmount" placeholder="0">
          </div>
          <div class="form-group">
            <label>Notes de Réconciliation</label>
            <textarea [(ngModel)]="reconciliationNotes" placeholder="Notes optionnelles"></textarea>
          </div>
          <div class="modal-actions">
            <button (click)="closeModal()" class="btn btn-secondary">Annuler</button>
            <button (click)="closeSession()" class="btn btn-danger" [disabled]="loading">
              {{ loading ? 'Fermeture...' : 'Fermer' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>
    </div>
  `,
  styles: [`
    .admin-panel {
      padding: 20px;
      max-width: 600px;
    }

    h1 {
      color: #fff;
      margin-bottom: 30px;
    }

    .status-panel {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .session-info, .no-session {
      color: #e5e7eb;
    }

    .session-info h2 {
      color: #fff;
      margin-bottom: 15px;
    }

    .session-info p {
      margin: 10px 0;
    }

    .open {
      color: #10b981;
      font-weight: bold;
    }

    .closed {
      color: #ef4444;
      font-weight: bold;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 15px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 30px;
      max-width: 400px;
      color: #e5e7eb;
    }

    .modal-content h2 {
      color: #fff;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #d1d5db;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 4px;
      color: #e5e7eb;
      font-family: inherit;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .alert {
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .alert-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .alert-success {
      background: #dcfce7;
      color: #166534;
    }
  `]
})
export class GlobalSessionComponent implements OnInit {
  currentSession: any = null;
  showOpenModal = false;
  showCloseModal = false;
  loading = false;
  error = '';
  success = '';
  initialAmount = 0;
  finalAmount = 0;
  reconciliationNotes = '';

  constructor(
    private globalSessionService: GlobalSessionService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCurrentSession();
  }

  loadCurrentSession() {
    this.globalSessionService.currentSession$.subscribe(session => {
      this.currentSession = session;
    });
  }

  openOpenModal() {
    this.showOpenModal = true;
    this.error = '';
    this.success = '';
  }

  openCloseModal() {
    this.showCloseModal = true;
    this.error = '';
    this.success = '';
  }

  closeModal() {
    this.showOpenModal = false;
    this.showCloseModal = false;
    this.initialAmount = 0;
    this.finalAmount = 0;
    this.reconciliationNotes = '';
  }

  openSession() {
    this.loading = true;
    this.globalSessionService.openSession(this.initialAmount).subscribe(
      () => {
        this.loading = false;
        this.success = 'Session ouverte avec succès';
        this.closeModal();
        this.loadCurrentSession();
      },
      error => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de l\'ouverture de la session';
      }
    );
  }

  closeSession() {
    if (!this.currentSession) return;
    this.loading = true;
    this.globalSessionService.closeSession(this.currentSession.publicId, this.finalAmount, this.reconciliationNotes).subscribe(
      () => {
        this.loading = false;
        this.success = 'Session fermée avec succès';
        this.closeModal();
        this.loadCurrentSession();
      },
      error => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de la fermeture de la session';
      }
    );
  }

  formatCurrency(value: number): string {
    if (!value) return '0.00 XAF';
    return (value / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' });
  }
}
