import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalSessionService } from '@core/services/global-session.service';
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
    if (!value) return '0 FCFA';
    const formatted = Math.round(value / 100).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }
}
