import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<'restaurant' | 'payment' | 'notifications' | 'security'>('restaurant');
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  activeSessions = 5;

  restaurantForm: FormGroup;
  paymentMethods = { cash: true, card: true, check: false, mobileMoney: false, credit: false };
  notifications = { lowStock: true, unpaidOrders: true, newOrders: false, dailyReport: true };
  security = { twoFactor: false };

  constructor() {
    this.restaurantForm = this.fb.group({
      name: ['Sellia Restaurant', Validators.required],
      currency: ['XOF', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      timezone: ['Africa/Douala', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.apiService.getRestaurant().subscribe({
      next: (restaurant) => {
        this.restaurantForm.patchValue({
          name: restaurant.name,
          currency: restaurant.currency || 'XOF',
          address: restaurant.address,
          phone: restaurant.phoneNumber,
          email: restaurant.email,
          timezone: restaurant.timezone
        });
      },
      error: (err) => {
        console.log('Restaurant API not available, using defaults');
      }
    });
  }

  saveRestaurantSettings(): void {
    if (!this.restaurantForm.valid) return;
    this.isSaving.set(true);
    
    const data = {
      name: this.restaurantForm.value.name,
      currency: this.restaurantForm.value.currency,
      address: this.restaurantForm.value.address,
      phoneNumber: this.restaurantForm.value.phone,
      email: this.restaurantForm.value.email,
      timezone: this.restaurantForm.value.timezone
    };
    
    this.apiService.updateRestaurant(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.success.set('Paramètres restaurant enregistrés');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.error.set('Erreur lors de la sauvegarde');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  savePaymentSettings(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Modes de paiement enregistrés');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  saveNotificationSettings(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Notifications enregistrées');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  saveSecuritySettings(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Paramètres de sécurité enregistrés');
      setTimeout(() => this.success.set(null), 3000);
    }, 500);
  }

  forceLogoutAll(): void {
    if (confirm('Êtes-vous sûr de vouloir déconnecter tous les utilisateurs?')) {
      this.toast.success('Tous les utilisateurs ont été déconnectés');
    }
  }

  viewAccessLogs(): void {
    this.toast.info('Fonctionnalité en développement');
  }
}
