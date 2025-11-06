import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalSessionService, GlobalSessionSummary } from '@core/services/global-session.service';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-global-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-session.component.html',
  styleUrls: ['./global-session.component.css']
})
export class GlobalSessionComponent implements OnInit {
  currentSession: any = null;
  sessionSummary: GlobalSessionSummary | null = null;
  showOpenModal = false;
  showCloseModal = false;
  loading = false;
  loadingSummary = false;
  error = '';
  success = '';
  finalAmount = 0;
  reconciliationNotes = '';

  // Expose Math for template
  Math = Math;

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
    if (!this.currentSession) return;

    // Load summary before opening modal
    this.loadingSummary = true;
    this.globalSessionService.getSummary(this.currentSession.publicId).subscribe({
      next: (summary) => {
        this.sessionSummary = summary;
        this.loadingSummary = false;
        this.showCloseModal = true;
        this.error = '';
        this.success = '';
        this.finalAmount = 0;
        this.reconciliationNotes = '';
      },
      error: (err) => {
        this.loadingSummary = false;
        this.error = err.error?.message || 'Erreur lors du chargement du résumé';
      }
    });
  }

  closeModal() {
    this.showOpenModal = false;
    this.showCloseModal = false;
    this.finalAmount = 0;
    this.reconciliationNotes = '';
    this.sessionSummary = null;
  }

  openSession() {
    this.loading = true;
    this.globalSessionService.openSession().subscribe(
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
    if (!this.currentSession || !this.reconciliationNotes) return;
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

  get discrepancy(): number {
    if (!this.sessionSummary) return 0;
    return this.finalAmount - this.sessionSummary.expectedAmount;
  }

  get discrepancyFormatted(): string {
    const disc = this.discrepancy;
    if (disc === 0) return '0 FCFA';
    const prefix = disc > 0 ? '+' : '';
    return prefix + this.formatCurrency(Math.abs(disc));
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const formatted = Math.round(value).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }
}
