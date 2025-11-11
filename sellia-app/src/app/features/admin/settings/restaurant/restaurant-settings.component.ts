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
  logoPreview = signal<string | null>(null);
  selectedLogo: File | null = null;
  restaurantExists = signal(false);

  form = {
    name: '',
    description: '',
    logoUrl: '',
    address: '',
    phoneNumber: '',
    email: '',
    currency: 'XOF',
    timezone: 'Africa/Douala',
    taxRate: 0,
    maxCashOperationAmount: 50000,
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
        this.restaurantExists.set(true);
        this.form = { ...this.form, ...data };

        // Set logo preview if logoUrl exists
        if (data.logoUrl) {
          this.logoPreview.set(this.getLogoUrl(data.logoUrl));
        }
      },
      error: (err) => {
        console.error('[RestaurantSettings] Error:', err);
        // Restaurant doesn't exist yet (404)
        if (err.status === 404) {
          this.restaurantExists.set(false);
        } else {
          this.toast.error(`Erreur ${err.status}: ${err.statusText || 'Erreur inconnue'}`);
        }
      }
    });
  }

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('Le fichier est trop volumineux (max 5MB)');
        input.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toast.error('Seules les images sont acceptées');
        input.value = '';
        return;
      }

      this.selectedLogo = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  private getLogoUrl(logoUrl: string): string {
    if (!logoUrl) return '';
    if (logoUrl.startsWith('http')) return logoUrl;

    const apiUrl = this.apiService['apiUrl'];
    const filename = logoUrl.includes('/') ? logoUrl.split('/').pop() : logoUrl;
    return `${apiUrl}/restaurant/logo/${filename}`;
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.toast.warning('Le nom du restaurant est requis');
      return;
    }

    this.isSaving.set(true);

    // Create FormData
    const formData = new FormData();
    formData.append('name', this.form.name);
    if (this.form.description) formData.append('description', this.form.description);
    if (this.form.address) formData.append('address', this.form.address);
    if (this.form.phoneNumber) formData.append('phoneNumber', this.form.phoneNumber);
    if (this.form.email) formData.append('email', this.form.email);
    formData.append('currency', this.form.currency);
    formData.append('timezone', this.form.timezone);
    formData.append('taxRate', this.form.taxRate.toString());
    formData.append('maxCashOperationAmount', this.form.maxCashOperationAmount.toString());
    if (this.form.openingHours) formData.append('openingHours', this.form.openingHours);

    // Add logo file if selected
    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    // Call appropriate method based on whether restaurant exists
    const request$ = this.restaurantExists()
      ? this.apiService.updateRestaurant(formData)
      : this.apiService.createRestaurant(formData);

    request$.subscribe({
      next: () => {
        const action = this.restaurantExists() ? 'mise à jour' : 'création';
        this.toast.success(`Configuration restaurant ${action === 'création' ? 'créée' : 'mise à jour'}`);
        this.restaurantExists.set(true); // Update flag after successful creation
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
