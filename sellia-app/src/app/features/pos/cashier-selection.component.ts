import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalSessionService } from '@core/services/global-session.service';
import { CashierSessionService } from '@core/services/cashier-session.service';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-cashier-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="cashier-selection-container">
      <div class="card">
        <h1>Sélectionner votre caisse</h1>

        <!-- No Global Session -->
        <div *ngIf="!globalSessionOpen" class="alert alert-danger">
          <p>La session globale n'est pas ouverte. Veuillez contacter l'administrateur.</p>
        </div>

        <!-- Cashier Selection Form -->
        <form [formGroup]="selectionForm" *ngIf="globalSessionOpen" (ngSubmit)="onSelectCashier()">
          <div class="form-group">
            <label>Caisse</label>
            <select formControlName="cashier" class="form-control">
              <option value="">-- Sélectionner une caisse --</option>
              <option *ngFor="let c of myCashiers" [value]="c.publicId">
                {{ c.name }} ({{ c.cashierNumber }})
              </option>
            </select>
            <small *ngIf="selectionForm.get('cashier')?.invalid && selectionForm.get('cashier')?.touched" class="text-danger">
              Veuillez sélectionner une caisse
            </small>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!selectionForm.valid || loading">
            {{ loading ? 'Chargement...' : 'Suivant' }}
          </button>
        </form>

        <!-- PIN Entry Form -->
        <form [formGroup]="pinForm" *ngIf="showPinForm" (ngSubmit)="onSubmitPin()">
          <h3>Entrez votre code PIN</h3>
          <div class="form-group">
            <input
              type="password"
              formControlName="pin"
              class="form-control pin-input"
              placeholder="0000"
              maxlength="4"
              [readonly]="loading"
            />
            <small *ngIf="pinError" class="text-danger">{{ pinError }}</small>
          </div>

          <div class="button-group">
            <button type="button" class="btn btn-secondary" (click)="cancelPin()" [disabled]="loading">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="!pinForm.valid || loading">
              {{ loading ? 'Vérification...' : 'Valider' }}
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div *ngIf="sessionOpened" class="alert alert-success">
          <p>Session ouverte avec succès! Redirection...</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="alert alert-danger">
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cashier-selection-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 40px;
      max-width: 500px;
      width: 100%;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .pin-input {
      letter-spacing: 10px;
      font-size: 24px;
      text-align: center;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #5568d3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .alert {
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    small {
      display: block;
      margin-top: 5px;
    }
  `]
})
export class CashierSelectionComponent implements OnInit {
  selectionForm: FormGroup;
  pinForm: FormGroup;
  myCashiers: any[] = [];
  globalSessionOpen = false;
  showPinForm = false;
  sessionOpened = false;
  loading = false;
  error = '';
  pinError = '';

  constructor(
    private fb: FormBuilder,
    private globalSessionService: GlobalSessionService,
    private cashierSessionService: CashierSessionService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.selectionForm = this.fb.group({
      cashier: ['', Validators.required]
    });

    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]]
    });
  }

  ngOnInit(): void {
    this.checkGlobalSession();
    this.loadMyCashiers();
  }

  private checkGlobalSession(): void {
    this.globalSessionService.loadCurrentSession();
    this.globalSessionService.currentSession$.subscribe((session) => {
      this.globalSessionOpen = session !== null && session.status === 'OPEN';
    });
  }

  private loadMyCashiers(): void {
    this.apiService.getMyCashiers().subscribe(
      (cashiers) => {
        this.myCashiers = cashiers;
      },
      (error) => {
        this.error = 'Erreur lors du chargement de vos caisses';
      }
    );
  }

  onSelectCashier(): void {
    if (this.selectionForm.valid) {
      this.showPinForm = true;
      this.pinError = '';
      this.pinForm.reset();
    }
  }

  onSubmitPin(): void {
    if (this.pinForm.valid) {
      this.loading = true;
      const cashierId = this.selectionForm.get('cashier')?.value;
      const pin = this.pinForm.get('pin')?.value;

      this.cashierSessionService.openSession(cashierId, pin).subscribe(
        (session) => {
          this.sessionOpened = true;
          setTimeout(() => {
            this.router.navigate(['/pos/orders']);
          }, 1000);
        },
        (error) => {
          this.loading = false;
          this.pinError = 'Code PIN incorrect ou caisse verrouillée';
        }
      );
    }
  }

  cancelPin(): void {
    this.showPinForm = false;
    this.pinForm.reset();
    this.pinError = '';
  }
}
