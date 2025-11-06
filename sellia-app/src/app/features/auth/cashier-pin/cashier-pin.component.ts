import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CashierSessionService } from '@core/services/cashier-session.service';
import { ApiService } from '@core/services/api.service';
import { GlobalSessionService } from '@core/services/global-session.service';

@Component({
  selector: 'app-cashier-pin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './cashier-pin.component.html',
  styleUrls: ['./cashier-pin.component.css']
})
export class CashierPinComponent implements OnInit {
  pinForm: FormGroup;
  myCashier = signal<any>(null);
  globalSessionOpen = signal(false);
  isLoading = signal(false);
  error = signal('');
  sessionOpened = signal(false);
  existingSession = signal<any>(null);

  // Two-step process: PIN then Initial Amount
  step = signal(1); // 1: PIN, 2: Initial Amount
  validatedPin = signal('');
  initialAmount = signal(0);

  constructor(
    private fb: FormBuilder,
    private cashierSessionService: CashierSessionService,
    private globalSessionService: GlobalSessionService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    this.checkGlobalSession();
    this.loadMyCashier();
    this.checkExistingSession();
  }

  private checkGlobalSession(): void {
    this.globalSessionService.loadCurrentSession();
    this.globalSessionService.currentSession$.subscribe((session) => {
      const isOpen = session !== null && session.status === 'OPEN';
      this.globalSessionOpen.set(isOpen);

      if (!isOpen) {
        this.error.set('Aucune session globale ouverte. Contactez l\'administrateur.');
      } else {
        // Effacer le message d'erreur si la session est ouverte
        if (this.error() === 'Aucune session globale ouverte. Contactez l\'administrateur.') {
          this.error.set('');
        }
      }
    });
  }

  private loadMyCashier(): void {
    this.isLoading.set(true);
    this.apiService.getMyCashiers().subscribe({
      next: (response: any) => {
        const cashiers = response?.content || response?.data || response || [];
        if (cashiers.length > 0) {
          this.myCashier.set(cashiers[0]);
          this.isLoading.set(false);
        } else {
          this.error.set('Aucune caisse assignée. Contactez l\'administrateur.');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de votre caisse');
        this.isLoading.set(false);
      }
    });
  }

  private checkExistingSession(): void {
    this.cashierSessionService.getCurrentSession().subscribe({
      next: (session) => {
        this.existingSession.set(session);
        // Si une session est déjà ouverte, rediriger directement
        if (session && session.status === 'OPEN') {
          this.sessionOpened.set(true);
          setTimeout(() => {
            this.router.navigate(['/pos/order-entry']);
          }, 500);
        } else if (session && session.status === 'LOCKED') {
          // Session verrouillée
        }
      },
      error: (err) => {
        // Pas de session existante, c'est normal
        this.existingSession.set(null);
      }
    });
  }

  onSubmitPin(): void {
    if (this.pinForm.invalid || !this.myCashier()) return;

    this.isLoading.set(true);
    this.error.set('');

    const pin = this.pinForm.get('pin')?.value;
    const cashierId = this.myCashier().publicId;

    // IMPORTANT: Re-vérifier s'il existe une session AVANT d'essayer d'ouvrir
    this.cashierSessionService.getCurrentSession().subscribe({
      next: (session) => {
        // Une session existe
        if (session && session.status === 'OPEN') {
          this.sessionOpened.set(true);
          this.isLoading.set(false);
          this.router.navigate(['/pos/order-entry']);
        } else if (session && session.status === 'LOCKED') {
          this.cashierSessionService.unlockSession(session.publicId, pin).subscribe({
            next: (unlockedSession) => {
              this.sessionOpened.set(true);
              this.isLoading.set(false);
              setTimeout(() => {
                this.router.navigate(['/pos/order-entry']);
              }, 1000);
            },
            error: (err) => {
              this.isLoading.set(false);
              const errorMsg = err.error?.message || 'Code PIN incorrect';
              this.error.set(errorMsg);
              this.pinForm.reset();
            }
          });
        }
      },
      error: (err) => {
        // Pas de session existante, passer à l'étape 2 pour demander le montant initial
        this.validatedPin.set(pin);

        // Charger le montant de fermeture de la session précédente
        this.apiService.getLastClosedSessionFinalAmount(cashierId).subscribe({
          next: (finalAmount) => {
            // Pré-remplir avec le solde de fermeture de la session précédente
            this.initialAmount.set(finalAmount || 0);
            this.step.set(2);
            this.isLoading.set(false);
          },
          error: () => {
            // En cas d'erreur, utiliser 0 comme montant par défaut
            this.initialAmount.set(0);
            this.step.set(2);
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  confirmOpenSession(): void {
    if (this.initialAmount() < 0) {
      this.error.set('Le montant initial ne peut pas être négatif');
      return;
    }

    const cashierId = this.myCashier().publicId;
    const pin = this.validatedPin();
    const amount = this.initialAmount();

    this.isLoading.set(true);
    this.error.set('');

    this.cashierSessionService.openSession(cashierId, pin, amount).subscribe({
      next: (session) => {
        this.sessionOpened.set(true);
        this.isLoading.set(false);
        setTimeout(() => {
          this.router.navigate(['/pos/order-entry']);
        }, 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.message || 'Erreur lors de l\'ouverture de la session';
        this.error.set(errorMsg);
      }
    });
  }

  backToPin(): void {
    this.step.set(1);
    this.validatedPin.set('');
    this.initialAmount.set(0);
    this.error.set('');
  }

  getFieldError(fieldName: string): boolean {
    const field = this.pinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
