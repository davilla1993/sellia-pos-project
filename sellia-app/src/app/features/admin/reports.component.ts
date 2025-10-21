import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="reports-container">
      <h1>Rapports</h1>

      <!-- Filter Form -->
      <div class="filter-panel">
        <form [formGroup]="filterForm" (ngSubmit)="applyFilter()">
          <div class="form-group">
            <label>Type de Rapport</label>
            <select formControlName="reportType" class="form-control" (change)="onReportTypeChange()">
              <option value="">-- Sélectionner un rapport --</option>
              <option value="global-session">Session Globale</option>
              <option value="cashier">Caisse</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>

          <div *ngIf="reportType === 'global-session'" class="form-group">
            <label>Session Globale</label>
            <input type="text" formControlName="globalSessionId" class="form-control" placeholder="ID Session" />
          </div>

          <div *ngIf="reportType === 'cashier'" class="form-group">
            <label>Caisse</label>
            <input type="text" formControlName="cashierId" class="form-control" placeholder="ID Caisse" />
          </div>

          <div *ngIf="reportType === 'user'" class="form-group">
            <label>Utilisateur</label>
            <input type="text" formControlName="userId" class="form-control" placeholder="ID Utilisateur" />
          </div>

          <div *ngIf="reportType !== 'global-session'" class="form-row">
            <div class="form-group">
              <label>Date Début</label>
              <input type="datetime-local" formControlName="startDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>Date Fin</label>
              <input type="datetime-local" formControlName="endDate" class="form-control" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!filterForm.valid || loading">
            {{ loading ? 'Chargement...' : 'Afficher Rapport' }}
          </button>
        </form>
      </div>

      <!-- Report Display -->
      <div *ngIf="reportData" class="report-panel">
        <div class="report-actions">
          <button (click)="downloadPdf()" class="btn btn-success" [disabled]="loading">
            📥 Télécharger PDF
          </button>
        </div>

        <!-- Global Session Report -->
        <div *ngIf="reportType === 'global-session'" class="report-content">
          <h2>Rapport Session Globale</h2>
          <div class="report-summary">
            <div class="summary-item">
              <span>Total Ventes:</span>
              <strong>{{ formatCurrency(reportData.totalSales) }}</strong>
            </div>
            <div class="summary-item">
              <span>Commandes:</span>
              <strong>{{ reportData.totalOrders }}</strong>
            </div>
            <div class="summary-item">
              <span>Remises:</span>
              <strong>{{ formatCurrency(reportData.totalDiscounts) }}</strong>
            </div>
            <div class="summary-item">
              <span>Montant Initial:</span>
              <strong>{{ formatCurrency(reportData.initialAmount) }}</strong>
            </div>
            <div class="summary-item">
              <span>Montant Final:</span>
              <strong>{{ formatCurrency(reportData.finalAmount) }}</strong>
            </div>
          </div>

          <h3>Sessions Caisses</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Caisse</th>
                <th>Utilisateur</th>
                <th>Ventes</th>
                <th>Commandes</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let session of reportData.cashierSessions">
                <td>{{ session.cashierName }}</td>
                <td>{{ session.userName }}</td>
                <td>{{ formatCurrency(session.totalSales) }}</td>
                <td>{{ session.orderCount }}</td>
                <td>{{ calculateDuration(session.openedAt, session.closedAt) }}</td>
              </tr>
            </tbody>
          </table>

          <h3>Top 10 Produits</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of reportData.topProducts">
                <td>{{ product.productName }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ formatCurrency(product.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cashier Report -->
        <div *ngIf="reportType === 'cashier'" class="report-content">
          <h2>Rapport Caisse: {{ reportData.cashierName }}</h2>
          <div class="report-summary">
            <div class="summary-item">
              <span>Total Ventes:</span>
              <strong>{{ formatCurrency(reportData.totalSales) }}</strong>
            </div>
            <div class="summary-item">
              <span>Commandes:</span>
              <strong>{{ reportData.totalOrders }}</strong>
            </div>
            <div class="summary-item">
              <span>Moyenne par Commande:</span>
              <strong>{{ formatCurrency(reportData.averageOrderValue) }}</strong>
            </div>
            <div class="summary-item">
              <span>Remises:</span>
              <strong>{{ formatCurrency(reportData.totalDiscounts) }}</strong>
            </div>
          </div>

          <h3>Utilisateurs</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Commandes</th>
                <th>Ventes</th>
                <th>Moyenne</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of reportData.users">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.orderCount }}</td>
                <td>{{ formatCurrency(user.totalSales) }}</td>
                <td>{{ formatCurrency(user.orderCount > 0 ? user.totalSales / user.orderCount : 0) }}</td>
              </tr>
            </tbody>
          </table>

          <h3>Top 10 Produits</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of reportData.topProducts">
                <td>{{ product.productName }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ formatCurrency(product.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- User Report -->
        <div *ngIf="reportType === 'user'" class="report-content">
          <h2>Rapport Utilisateur: {{ reportData.firstName }} {{ reportData.lastName }}</h2>
          <div class="report-summary">
            <div class="summary-item">
              <span>Total Ventes:</span>
              <strong>{{ formatCurrency(reportData.totalSales) }}</strong>
            </div>
            <div class="summary-item">
              <span>Commandes:</span>
              <strong>{{ reportData.totalOrders }}</strong>
            </div>
            <div class="summary-item">
              <span>Moyenne par Commande:</span>
              <strong>{{ formatCurrency(reportData.averageOrderValue) }}</strong>
            </div>
            <div class="summary-item">
              <span>Remises:</span>
              <strong>{{ formatCurrency(reportData.totalDiscounts) }}</strong>
            </div>
          </div>

          <h3>Caisses Utilisées</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Caisse</th>
                <th>Commandes</th>
                <th>Ventes</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cashier of reportData.cashiers">
                <td>{{ cashier.cashierName }}</td>
                <td>{{ cashier.orderCount }}</td>
                <td>{{ formatCurrency(cashier.totalSales) }}</td>
              </tr>
            </tbody>
          </table>

          <h3>Top 10 Produits</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of reportData.topProducts">
                <td>{{ product.productName }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ formatCurrency(product.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
    }

    h2 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    h3 {
      color: #666;
      margin-top: 25px;
      margin-bottom: 15px;
    }

    .filter-panel {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #5568d3;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .report-panel {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .report-actions {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .report-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .summary-item {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #667eea;
    }

    .summary-item span {
      display: block;
      color: #666;
      font-size: 13px;
      margin-bottom: 5px;
    }

    .summary-item strong {
      display: block;
      color: #333;
      font-size: 18px;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .report-table th {
      background-color: #f9f9f9;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
      color: #555;
    }

    .report-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }

    .report-table tr:hover {
      background-color: #f9f9f9;
    }

    .alert {
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  reportData: any = null;
  reportType: string = '';
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.filterForm = this.fb.group({
      reportType: ['', Validators.required],
      globalSessionId: [''],
      cashierId: [''],
      userId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {}

  onReportTypeChange(): void {
    this.reportType = this.filterForm.get('reportType')?.value || '';
    this.reportData = null;
    this.error = '';

    // Update validators based on report type
    if (this.reportType === 'global-session') {
      this.filterForm.get('globalSessionId')?.setValidators([Validators.required]);
      this.filterForm.get('cashierId')?.clearValidators();
      this.filterForm.get('userId')?.clearValidators();
      this.filterForm.get('startDate')?.clearValidators();
      this.filterForm.get('endDate')?.clearValidators();
    } else if (this.reportType === 'cashier') {
      this.filterForm.get('cashierId')?.setValidators([Validators.required]);
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
      this.filterForm.get('globalSessionId')?.clearValidators();
      this.filterForm.get('userId')?.clearValidators();
    } else if (this.reportType === 'user') {
      this.filterForm.get('userId')?.setValidators([Validators.required]);
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
      this.filterForm.get('globalSessionId')?.clearValidators();
      this.filterForm.get('cashierId')?.clearValidators();
    }

    this.filterForm.updateValueAndValidity();
  }

  applyFilter(): void {
    if (!this.filterForm.valid) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.reportType === 'global-session') {
      this.apiService.getGlobalSessionReport(this.filterForm.get('globalSessionId')?.value).subscribe(
        (data) => {
          this.reportData = data;
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement du rapport';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'cashier') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);
      
      this.apiService.getCashierReport(this.filterForm.get('cashierId')?.value, startDate, endDate).subscribe(
        (data) => {
          this.reportData = data;
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement du rapport';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'user') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);
      
      this.apiService.getUserReport(this.filterForm.get('userId')?.value, startDate, endDate).subscribe(
        (data) => {
          this.reportData = data;
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement du rapport';
          this.loading = false;
        }
      );
    }
  }

  downloadPdf(): void {
    if (!this.reportData) return;

    this.loading = true;

    if (this.reportType === 'global-session') {
      this.apiService.downloadGlobalSessionReportPdf(this.reportData.publicId).subscribe(
        (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-session-${this.reportData.publicId}.pdf`);
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du téléchargement du PDF';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'cashier') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadCashierReportPdf(this.reportData.cashierPublicId, startDate, endDate).subscribe(
        (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-caisse-${this.reportData.cashierPublicId}.pdf`);
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du téléchargement du PDF';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'user') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadUserReportPdf(this.reportData.userPublicId, startDate, endDate).subscribe(
        (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-utilisateur-${this.reportData.userPublicId}.pdf`);
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du téléchargement du PDF';
          this.loading = false;
        }
      );
    }
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const formatted = Math.round(value / 100).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  calculateDuration(start: string, end: string): string {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private formatDateForApi(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString();
  }
}
