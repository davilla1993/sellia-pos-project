import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '@core/services/navigation.service';
import { ApiService } from '@core/services/api.service';
import { OrderNotificationService } from '@core/services/order-notification.service';
import { CashierSessionService } from '@core/services/cashier-session.service';
import { CashOperationService, CashOperation, CashOperationTotals } from '@core/services/cash-operation.service';
import { AudioNotificationControlComponent } from '@shared/components/audio-notification-control/audio-notification-control.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AudioNotificationControlComponent, FormsModule],
  templateUrl: './pos-layout.component.html',
  styleUrls: ['./pos-layout.component.css']
})
export class PosLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private orderNotificationService = inject(OrderNotificationService);
  private cashierSessionService = inject(CashierSessionService);
  private cashOperationService = inject(CashOperationService);
  private toast = inject(ToastService);
  navigationService = inject(NavigationService);

  // Expose Math for template
  Math = Math;

  currentRoute = signal('');
  pendingOrdersCount = signal(0);
  currentCashierSession = signal<any>(null);
  isLocked = signal(false);
  unlockPin = signal('');
  unlocking = signal(false);
  restaurantSettings = signal<any>(null);

  // Open Session Modal
  showOpenSessionModal = signal(false);
  openSessionStep = signal(1); // 1: Enter PIN (or select if multiple), 2: Enter initial amount
  myCashiers = signal<any[]>([]);
  selectedCashier = signal<any>(null);
  openSessionPin = signal('');
  initialAmount = signal(0);
  openingSession = signal(false);
  openSessionError = signal('');
  loadingCashiers = signal(false);

  // Close Session Modal
  showCloseSessionModal = signal(false);
  closeFinalAmount = signal(0);
  closeNotes = signal('');
  closingSession = signal(false);
  closeSessionError = signal('');

  // Cash Operations Modal
  showCashOperationsModal = signal(false);
  cashOperationType = signal<'ENTREE' | 'SORTIE'>('SORTIE');
  cashOperationAmount = signal(0);
  cashOperationDescription = signal('');
  cashOperationReference = signal('');
  cashOperationAuthorizedBy = signal('');
  savingCashOperation = signal(false);
  cashOperationError = signal('');
  cashOperations = signal<CashOperation[]>([]);
  cashOperationTotals = signal<CashOperationTotals | null>(null);
  loadingCashOperations = signal(false);

  // Computed values for closing
  get expectedAmount(): number {
    const session = this.currentCashierSession();
    if (!session) return 0;
    const cashOps = this.cashOperationTotals();
    const totalEntrees = cashOps?.totalEntrees || session.totalCashEntrees || 0;
    const totalSorties = cashOps?.totalSorties || session.totalCashSorties || 0;
    return (session.initialAmount || 0) + (session.totalSales || 0) + totalEntrees - totalSorties;
  }

  get discrepancy(): number {
    const realAmount = this.closeFinalAmount();
    const expected = this.expectedAmount;
    return realAmount - expected;
  }

  get discrepancyFormatted(): string {
    const disc = this.discrepancy;
    if (disc === 0) return '0 FCFA';
    const prefix = disc > 0 ? '+' : '';
    return prefix + this.formatCurrency(Math.abs(disc));
  }

  constructor() {
    effect(() => {
      if (this.currentRoute() && this.currentRoute().includes('/pos')) {
        this.loadPendingOrdersCount();
      }
    });
  }

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);
    this.loadPendingOrdersCount();
    setInterval(() => this.loadPendingOrdersCount(), 5000);

    // Start monitoring order changes for notifications
    this.orderNotificationService.startMonitoring();

    // Subscribe to cashier session updates
    this.cashierSessionService.currentSession$.subscribe(session => {
      this.currentCashierSession.set(session);
      this.isLocked.set(session?.status === 'LOCKED');
    });

    // Load restaurant settings for cash operation limit
    this.loadRestaurantSettings();
  }

  loadRestaurantSettings(): void {
    this.apiService.getRestaurant().subscribe({
      next: (settings) => {
        this.restaurantSettings.set(settings);
      },
      error: () => {
        // Silent fail, not critical
      }
    });
  }

  ngOnDestroy(): void {
    this.orderNotificationService.stopMonitoring();
  }

  loadPendingOrdersCount(): void {
    this.apiService.getOrdersByStatus('EN_ATTENTE').subscribe({
      next: (response: any) => {
        const data = response?.content || response?.data || response || [];
        const count = Array.isArray(data) ? data.length : 0;
        this.pendingOrdersCount.set(count);
      },
      error: () => {
        this.pendingOrdersCount.set(0);
      }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.currentRoute.set(route);
  }

  isActive(route: string): boolean {
    const currentRoute = this.currentRoute();
    // Exact match or match with trailing slash
    return currentRoute === route || currentRoute === route + '/';
  }

  isInKitchenContext(): boolean {
    const route = this.currentRoute();
    return route.includes('/pos/kitchen');
  }

  isInBarContext(): boolean {
    const route = this.currentRoute();
    return route.includes('/pos/bar');
  }

  isInPendingOrdersContext(): boolean {
    const route = this.currentRoute();
    return route.includes('/pos/pending-orders');
  }

  shouldShowSessionControls(): boolean {
    // Ne pas afficher les contrôles de session pour les ADMIN
    if (this.navigationService.isAdmin()) {
      return false;
    }
    // Ne pas afficher les contrôles de session sur kitchen, bar et pending-orders
    return !this.isInKitchenContext() && !this.isInBarContext() && !this.isInPendingOrdersContext();
  }

  getCurrentUserInfo(): string {
    return `${this.navigationService.getCurrentUserName()} • ${this.navigationService.getCurrentUserRole()}`;
  }

  getCashierInfo(): string {
    const session = this.currentCashierSession();
    if (session?.cashier) {
      return session.cashier.name || `Caisse ${session.cashier.cashierNumber}`;
    }
    return '';
  }

  hasCashierSession(): boolean {
    return this.currentCashierSession() !== null;
  }

  canManageCashierSession(): boolean {
    const role = this.navigationService.getCurrentUserRole();
    return role === 'CAISSE' || role === 'ADMIN';
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    // Vérifier qu'il n'y a pas de session active avant de déconnecter
    if (this.hasCashierSession()) {
      this.toast.error('⚠️ Vous devez fermer votre session de caisse avant de vous déconnecter.');
      return;
    }
    this.router.navigate(['/auth/login']);
  }

  lockSession(): void {
    const session = this.currentCashierSession();
    if (!session) {
      this.toast.error('Aucune session de caisse active');
      return;
    }

    this.cashierSessionService.lockSession(session.publicId).subscribe({
      next: () => {
        this.toast.success('Session verrouillée');
      },
      error: (err) => {
        this.toast.error('Erreur lors du verrouillage');
      }
    });
  }

  unlockSession(): void {
    const session = this.currentCashierSession();
    const pin = this.unlockPin();

    if (!session) {
      this.toast.error('Aucune session de caisse active');
      return;
    }

    if (!pin || pin.length !== 4) {
      this.toast.error('Veuillez entrer un code PIN à 4 chiffres');
      return;
    }

    this.unlocking.set(true);
    this.cashierSessionService.unlockSession(session.publicId, pin).subscribe({
      next: () => {
        this.toast.success('Session déverrouillée');
        this.unlockPin.set('');
        this.unlocking.set(false);
      },
      error: (err) => {
        this.toast.error('Code PIN incorrect');
        this.unlockPin.set('');
        this.unlocking.set(false);
      }
    });
  }

  onPinKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.unlockSession();
    }
  }

  // Open Session Methods
  openOpenSessionModal(): void {
    this.showOpenSessionModal.set(true);
    this.openSessionStep.set(1);
    this.openSessionError.set('');
    this.openSessionPin.set('');
    this.initialAmount.set(0);
    this.selectedCashier.set(null);
    this.loadMyCashiers();
  }

  loadMyCashiers(): void {
    this.loadingCashiers.set(true);
    this.apiService.getMyCashiers().subscribe({
      next: (cashiers) => {
        this.myCashiers.set(cashiers);
        this.loadingCashiers.set(false);

        // Si une seule caisse, la sélectionner automatiquement
        if (cashiers.length === 1) {
          this.selectedCashier.set(cashiers[0]);
        } else if (cashiers.length === 0) {
          this.openSessionError.set('Aucune caisse assignée. Contactez l\'administrateur.');
        }
      },
      error: () => {
        this.loadingCashiers.set(false);
        this.openSessionError.set('Erreur lors du chargement des caisses');
      }
    });
  }

  selectCashier(cashier: any): void {
    this.selectedCashier.set(cashier);
  }

  submitOpenSessionPin(): void {
    const pin = this.openSessionPin();
    const cashier = this.selectedCashier();

    if (!cashier) {
      this.openSessionError.set('Veuillez sélectionner une caisse');
      return;
    }

    if (!pin || pin.length !== 4) {
      this.openSessionError.set('Le code PIN doit contenir 4 chiffres');
      return;
    }

    // Récupérer le solde final de la dernière session fermée
    this.apiService.getLastClosedSessionFinalAmount(cashier.publicId).subscribe({
      next: (finalAmount) => {
        this.initialAmount.set(finalAmount || 0);
        this.openSessionStep.set(2);
        this.openSessionError.set('');
      },
      error: () => {
        // Si pas de session précédente ou erreur, initialiser à 0
        this.initialAmount.set(0);
        this.openSessionStep.set(2);
        this.openSessionError.set('');
      }
    });
  }

  confirmOpenSession(): void {
    const cashier = this.selectedCashier();
    const pin = this.openSessionPin();
    const amount = this.initialAmount();

    if (!cashier) {
      this.openSessionError.set('Aucune caisse sélectionnée');
      return;
    }

    this.openingSession.set(true);
    this.openSessionError.set('');

    this.cashierSessionService.openSession(cashier.publicId, pin, amount).subscribe({
      next: (session) => {
        this.toast.success('Session ouverte avec succès');
        this.closeOpenSessionModal();
        this.openingSession.set(false);
      },
      error: (err) => {
        this.openingSession.set(false);
        const errorMessage = err?.error?.message || err?.message || '';
        if (errorMessage.toLowerCase().includes('pin')) {
          this.openSessionError.set('Code PIN incorrect');
          this.openSessionStep.set(2);
        } else if (errorMessage.toLowerCase().includes('already in use')) {
          this.openSessionError.set('Cette caisse est déjà utilisée');
        } else {
          this.openSessionError.set('Erreur lors de l\'ouverture de la session');
        }
      }
    });
  }

  closeOpenSessionModal(): void {
    this.showOpenSessionModal.set(false);
    this.openSessionStep.set(1);
    this.selectedCashier.set(null);
    this.openSessionPin.set('');
    this.initialAmount.set(0);
    this.openSessionError.set('');
  }

  backOpenSessionStep(): void {
    if (this.openSessionStep() === 2) {
      this.openSessionStep.set(1);
      this.openSessionError.set('');
      this.initialAmount.set(0);
    }
  }

  // Close Session Methods
  openCloseSessionModal(): void {
    const session = this.currentCashierSession();
    if (!session) {
      this.toast.error('Aucune session active');
      return;
    }
    this.showCloseSessionModal.set(true);
    this.closeFinalAmount.set(0);
    this.closeNotes.set('');
    this.closeSessionError.set('');
    // Load cash operation totals for display in close modal
    this.loadCashOperationTotals();
  }

  confirmCloseSession(): void {
    const session = this.currentCashierSession();
    const finalAmount = this.closeFinalAmount();
    const notes = this.closeNotes();

    if (!session) {
      this.closeSessionError.set('Aucune session active');
      return;
    }

    if (finalAmount < 0) {
      this.closeSessionError.set('Le montant réel ne peut pas être négatif');
      return;
    }

    if (!notes || notes.trim() === '') {
      this.closeSessionError.set('Veuillez ajouter des notes');
      return;
    }

    this.closingSession.set(true);
    this.closeSessionError.set('');

    this.cashierSessionService.closeSession(
      session.publicId,
      finalAmount,
      notes
    ).subscribe({
      next: () => {
        this.toast.success('Session fermée avec succès');
        this.closeCloseSessionModal();
        this.closingSession.set(false);
        // Redirection vers la page de connexion
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1000);
      },
      error: (err) => {
        this.closingSession.set(false);
        this.closeSessionError.set('Erreur lors de la fermeture de la session');
      }
    });
  }

  closeCloseSessionModal(): void {
    this.showCloseSessionModal.set(false);
    this.closeFinalAmount.set(0);
    this.closeNotes.set('');
    this.closeSessionError.set('');
  }

  // Cash Operations Methods
  openCashOperationsModal(): void {
    const session = this.currentCashierSession();
    if (!session) {
      this.toast.error('Aucune session active');
      return;
    }
    this.showCashOperationsModal.set(true);
    this.resetCashOperationForm();
    this.loadCashOperations();
    this.loadCashOperationTotals();
  }

  closeCashOperationsModal(): void {
    this.showCashOperationsModal.set(false);
    this.resetCashOperationForm();
  }

  resetCashOperationForm(): void {
    this.cashOperationType.set('SORTIE');
    this.cashOperationAmount.set(0);
    this.cashOperationDescription.set('');
    this.cashOperationReference.set('');
    this.cashOperationAuthorizedBy.set('');
    this.cashOperationError.set('');
  }

  loadCashOperations(): void {
    const session = this.currentCashierSession();
    if (!session) return;

    this.loadingCashOperations.set(true);
    this.cashOperationService.getOperationsBySession(session.publicId).subscribe({
      next: (operations) => {
        this.cashOperations.set(operations);
        this.loadingCashOperations.set(false);
      },
      error: () => {
        this.loadingCashOperations.set(false);
        this.toast.error('Erreur lors du chargement des opérations');
      }
    });
  }

  loadCashOperationTotals(): void {
    const session = this.currentCashierSession();
    if (!session) return;

    this.cashOperationService.getTotalsBySession(session.publicId).subscribe({
      next: (totals) => {
        this.cashOperationTotals.set(totals);
      },
      error: () => {
        this.cashOperationTotals.set(null);
      }
    });
  }

  submitCashOperation(): void {
    const session = this.currentCashierSession();
    if (!session) {
      this.cashOperationError.set('Aucune session active');
      return;
    }

    const amount = this.cashOperationAmount();
    const description = this.cashOperationDescription();
    const authorizedBy = this.cashOperationAuthorizedBy();

    if (amount <= 0) {
      this.cashOperationError.set('Le montant doit être supérieur à 0');
      return;
    }

    if (!description || description.trim() === '') {
      this.cashOperationError.set('La description est requise');
      return;
    }

    if (!authorizedBy || authorizedBy.trim() === '') {
      this.cashOperationError.set('Le nom de l\'autorisation est requis');
      return;
    }

    // Check if amount exceeds maximum (warning only, non-blocking)
    const settings = this.restaurantSettings();
    if (settings?.maxCashOperationAmount && amount > settings.maxCashOperationAmount) {
      this.toast.warning(`⚠️ Attention: Le montant dépasse la limite configurée de ${this.formatCurrency(settings.maxCashOperationAmount)}`);
    }

    this.savingCashOperation.set(true);
    this.cashOperationError.set('');

    const request = {
      cashierSessionId: session.publicId,
      type: this.cashOperationType(),
      amount: amount,
      description: description.trim(),
      reference: this.cashOperationReference() || undefined,
      authorizedBy: authorizedBy.trim()
    };

    this.cashOperationService.createCashOperation(request).subscribe({
      next: () => {
        this.toast.success('Opération enregistrée avec succès');
        this.savingCashOperation.set(false);
        this.resetCashOperationForm();
        this.loadCashOperations();
        this.loadCashOperationTotals();
        // Recharger la session pour mettre à jour les totaux
        this.cashierSessionService.loadCurrentSession();
      },
      error: (err) => {
        this.savingCashOperation.set(false);
        const errorMsg = err?.error?.message || 'Erreur lors de l\'enregistrement';
        this.cashOperationError.set(errorMsg);
      }
    });
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }
}
