import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-cashiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">
      <div class="header">
        <h1>Gestion des Caisses</h1>
        <button (click)="openCreateModal()" class="btn btn-primary">+ Nouvelle Caisse</button>
      </div>

      <div class="cashiers-grid">
        <div *ngFor="let cashier of cashiers" class="cashier-card">
          <div class="card-header">
            <h3>{{ cashier.name }}</h3>
            <span class="badge" [class.active]="cashier.status === 'ACTIVE'">{{ cashier.status }}</span>
          </div>
          <p class="number">Caisse: {{ cashier.cashierNumber }}</p>
          <p>Utilisateurs: {{ cashier.assignedUsers?.length || 0 }}</p>
          <div class="card-actions">
            <button (click)="changeCashierPin(cashier)" class="btn btn-sm">🔐 PIN</button>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showModal" class="modal">
        <div class="modal-content">
          <h2>Nouvelle Caisse</h2>
          <div class="form-group">
            <label>Nom</label>
            <input type="text" [(ngModel)]="formData.name" placeholder="ex: Caisse 1">
          </div>
          <div class="form-group">
            <label>Numéro</label>
            <input type="text" [(ngModel)]="formData.cashierNumber" placeholder="ex: CAISSE_001">
          </div>
          <div class="form-group">
            <label>Code PIN (4 chiffres)</label>
            <input type="password" [(ngModel)]="formData.pin" placeholder="0000" maxlength="4">
          </div>
          <div class="modal-actions">
            <button (click)="closeModal()" class="btn btn-secondary">Annuler</button>
            <button (click)="saveCashier()" class="btn btn-primary" [disabled]="loading">Enregistrer</button>
          </div>
        </div>
      </div>

      <!-- Change PIN Modal -->
      <div *ngIf="showPinModal" class="modal">
        <div class="modal-content">
          <h2>Changer le Code PIN</h2>
          <p class="info">Caisse: {{ editingCashier?.name }}</p>
          <div class="form-group">
            <label>Nouveau Code PIN (4 chiffres)</label>
            <input type="password" [(ngModel)]="newPin" placeholder="0000" maxlength="4">
          </div>
          <div class="modal-actions">
            <button (click)="closePinModal()" class="btn btn-secondary">Annuler</button>
            <button (click)="savePin()" class="btn btn-primary" [disabled]="loading">Enregistrer</button>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>
    </div>
  `,
  styles: [`
    .admin-panel { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    h1 { color: #fff; margin: 0; }
    .cashiers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .cashier-card { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; color: #e5e7eb; }
    .card-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }
    .card-header h3 { color: #fff; margin: 0; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #10b981; color: white; }
    .number { font-weight: bold; color: #667eea; margin: 10px 0; }
    .card-actions { display: flex; gap: 10px; margin-top: 15px; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 30px; max-width: 400px; color: #e5e7eb; }
    .modal-content h2 { color: #fff; margin-bottom: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; color: #d1d5db; }
    .form-group input { width: 100%; padding: 10px; background: #111827; border: 1px solid #374151; border-radius: 4px; color: #e5e7eb; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .alert { padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .alert-danger { background: #fee2e2; color: #991b1b; }
    .alert-success { background: #dcfce7; color: #166534; }
    .info { background: #111827; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
  `]
})
export class CashiersComponent implements OnInit {
  cashiers: any[] = [];
  showModal = false;
  showPinModal = false;
  loading = false;
  error = '';
  success = '';
  editingCashier: any = null;
  newPin = '';

  formData = { name: '', cashierNumber: '', pin: '' };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCashiers();
  }

  loadCashiers() {
    this.apiService.getAllCashiers().subscribe(
      (data) => { this.cashiers = data; },
      () => { this.error = 'Erreur lors du chargement'; }
    );
  }

  openCreateModal() {
    this.editingCashier = null;
    this.formData = { name: '', cashierNumber: '', pin: '' };
    this.showModal = true;
    this.error = '';
  }

  closeModal() {
    this.showModal = false;
  }

  saveCashier() {
    if (!this.formData.name || !this.formData.cashierNumber || !this.formData.pin) {
      this.error = 'Tous les champs sont requis';
      return;
    }
    this.loading = true;
    this.apiService.createCashier(this.formData).subscribe(
      () => {
        this.loading = false;
        this.success = 'Caisse créée avec succès';
        this.closeModal();
        this.loadCashiers();
      },
      (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de la création';
      }
    );
  }

  changeCashierPin(cashier: any) {
    this.editingCashier = cashier;
    this.newPin = '';
    this.showPinModal = true;
    this.error = '';
  }

  closePinModal() {
    this.showPinModal = false;
  }

  savePin() {
    if (!this.newPin || this.newPin.length !== 4) {
      this.error = 'Le PIN doit contenir 4 chiffres';
      return;
    }
    this.loading = true;
    this.apiService.changeCashierPin(this.editingCashier.publicId, this.newPin).subscribe(
      () => {
        this.loading = false;
        this.success = 'Code PIN modifié avec succès';
        this.closePinModal();
        this.loadCashiers();
      },
      (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de la modification';
      }
    );
  }
}
