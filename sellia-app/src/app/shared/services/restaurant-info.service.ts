import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

export interface RestaurantInfo {
  name: string;
  address: string;
  phoneNumber: string;
  logoUrl: string;
  description?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantInfoService {
  private apiService = inject(ApiService);

  restaurantInfo = signal<RestaurantInfo>({
    name: 'SELLIA RESTAURANT',
    address: '',
    phoneNumber: '',
    logoUrl: '/assets/logo.jpg' // Default fallback
  });

  isLoading = signal(false);
  isLoaded = signal(false);

  loadRestaurantInfo(): void {
    if (this.isLoaded()) return; // Don't reload if already loaded

    this.isLoading.set(true);
    this.apiService.getRestaurant().subscribe({
      next: (response: any) => {
        const info = response.data || response;
        this.restaurantInfo.set({
          name: info.name || 'SELLIA RESTAURANT',
          address: info.address || '',
          phoneNumber: info.phoneNumber || '',
          logoUrl: this.getLogoUrl(info.logoUrl) || '/assets/logo.jpg',
          description: info.description,
          email: info.email
        });
        this.isLoaded.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading restaurant info:', err);
        // Keep default values on error
        this.isLoading.set(false);
      }
    });
  }

  private getLogoUrl(logoUrl: string | undefined): string | undefined {
    if (!logoUrl) return undefined;
    if (logoUrl.startsWith('http')) return logoUrl;

    const apiUrl = this.apiService['apiUrl'];
    const filename = logoUrl.includes('/') ? logoUrl.split('/').pop() : logoUrl;
    return `${apiUrl}/restaurant/logo/${filename}`;
  }

  refreshRestaurantInfo(): void {
    this.isLoaded.set(false);
    this.loadRestaurantInfo();
  }
}
