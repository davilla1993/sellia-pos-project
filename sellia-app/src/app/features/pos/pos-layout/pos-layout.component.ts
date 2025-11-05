import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '@core/services/navigation.service';
import { ApiService } from '@core/services/api.service';
import { OrderNotificationService } from '@core/services/order-notification.service';
import { CashierSessionService } from '@core/services/cashier-session.service';
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

  // Computed values for closing
  get expectedAmount(): number {
    const session = this.currentCashierSession();
    if (!session) return 0;
    return (session.initialAmount || 0) + (session.totalSales || 0);
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

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
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

    this.openSessionStep.set(2);
    this.openSessionError.set('');
    this.initialAmount.set(0);
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

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }
}
