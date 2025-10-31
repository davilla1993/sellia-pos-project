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
  templateUrl: './cashier-selection.component.html',
  styleUrls: ['./cashier-selection.component.css']
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
