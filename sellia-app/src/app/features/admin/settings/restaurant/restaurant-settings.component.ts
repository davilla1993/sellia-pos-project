import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WritableSignal } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-restaurant-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-settings.component.html',
  styleUrls: ['./restaurant-settings.component.css']
})
export class RestaurantSettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  closeSignal = input<WritableSignal<boolean>>();
  isSaving = signal(false);
  
  form = {
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    currency: 'XOF',
    timezone: 'Africa/Douala',
    taxRate: 0,
    openingHours: ''
  };

  ngOnInit(): void {
    this.loadRestaurantData();
  }

  loadRestaurantData(): void {
    console.log('[RestaurantSettings] Loading data...');
    const token = localStorage.getItem('auth_token');
    console.log('[RestaurantSettings] Auth token exists:', !!token);
    
    this.apiService.getRestaurant().subscribe({
      next: (data) => {
        console.log('[RestaurantSettings] Data loaded:', data);
        this.form = { ...this.form, ...data };
      },
      error: (err) => {
        console.error('[RestaurantSettings] Error:', err);
        this.toast.error(`Erreur ${err.status}: ${err.statusText || 'Erreur inconnue'}`);
      }
    });
  }

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.toast.warning('Le nom du restaurant est requis');
      return;
    }

    this.isSaving.set(true);
    this.apiService.updateRestaurant(this.form).subscribe({
      next: () => {
        this.toast.success('Configuration restaurant enregistrée');
        this.closeModal();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error('Erreur lors de la sauvegarde');
        console.error(err);
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }
}
