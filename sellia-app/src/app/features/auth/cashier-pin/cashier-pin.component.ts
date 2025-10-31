import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CashierSessionService } from '@core/services/cashier-session.service';
import { ApiService } from '@core/services/api.service';
import { GlobalSessionService } from '@core/services/global-session.service';

@Component({
  selector: 'app-cashier-pin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
        console.log('Session existante trouvée:', session);
        this.existingSession.set(session);
        // Si une session est déjà ouverte, rediriger directement
        if (session.status === 'OPEN') {
          console.log('Session déjà OPEN, redirection vers POS');
          this.sessionOpened.set(true);
          setTimeout(() => {
            this.router.navigate(['/pos/order-entry']);
          }, 500);
        } else if (session.status === 'LOCKED') {
          console.log('Session LOCKED détectée, affichage écran de déverrouillage');
        }
      },
      error: (err) => {
        console.log('Aucune session existante (normal):', err.status);
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
    console.log('Vérification session existante avant soumission...');
    this.cashierSessionService.getCurrentSession().subscribe({
      next: (session) => {
        console.log('Session trouvée:', session);
        // Une session existe
        if (session.status === 'OPEN') {
          console.log('Session déjà OPEN, redirection');
          this.sessionOpened.set(true);
          this.isLoading.set(false);
          this.router.navigate(['/pos/order-entry']);
        } else if (session.status === 'LOCKED') {
          console.log('Session LOCKED, déverrouillage...');
          this.cashierSessionService.unlockSession(session.publicId, pin).subscribe({
            next: (unlockedSession) => {
              console.log('Session déverrouillée avec succès');
              this.sessionOpened.set(true);
              this.isLoading.set(false);
              setTimeout(() => {
                this.router.navigate(['/pos/order-entry']);
              }, 1000);
            },
            error: (err) => {
              console.error('Erreur déverrouillage:', err);
              this.isLoading.set(false);
              const errorMsg = err.error?.message || 'Code PIN incorrect';
              this.error.set(errorMsg);
              this.pinForm.reset();
            }
          });
        }
      },
      error: (err) => {
        console.log('Pas de session existante (normal), ouverture nouvelle session');
        // Pas de session existante, ouvrir une nouvelle
        this.cashierSessionService.openSession(cashierId, pin).subscribe({
          next: (session) => {
            console.log('Session ouverte avec succès');
            this.sessionOpened.set(true);
            this.isLoading.set(false);
            setTimeout(() => {
              this.router.navigate(['/pos/order-entry']);
            }, 1000);
          },
          error: (err) => {
            console.error('Erreur ouverture session:', err);
            this.isLoading.set(false);
            const errorMsg = err.error?.message || 'Code PIN incorrect';
            this.error.set(errorMsg);
            this.pinForm.reset();
          }
        });
      }
    });
  }

  getFieldError(fieldName: string): boolean {
    const field = this.pinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
