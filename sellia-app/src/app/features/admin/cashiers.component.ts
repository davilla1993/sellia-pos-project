import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-cashiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashiers.component.html',
  styleUrls: ['./cashiers.component.css']
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
