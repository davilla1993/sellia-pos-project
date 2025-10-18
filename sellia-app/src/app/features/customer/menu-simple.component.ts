import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../shared/models/types';

@Component({
  selector: 'app-menu-simple',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="section-header">
        <h1 class="section-title">Our Menu</h1>
        <p class="section-subtitle">Explore our delicious offerings</p>
      </div>

      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let product of products()" class="card card-hover">
          <div class="w-full h-48 bg-neutral-200 rounded-lg mb-4">
            <img *ngIf="product.imageUrl" [src]="product.imageUrl" alt="product" class="w-full h-full object-cover" />
          </div>
          <h3 class="text-xl font-semibold text-dark mb-2">{{ product.name }}</h3>
          <p class="text-neutral-600 text-sm mb-4">{{ product.description }}</p>
          <div class="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200">
            <span class="text-2xl font-bold text-primary">{{ getPrice(product) }}</span>
            <button *ngIf="product.available" class="btn-primary text-sm py-2 px-4">Add</button>
            <span *ngIf="!product.available" class="text-xs text-red-600">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MenuSimpleComponent implements OnInit {
  products = signal<Product[]>([]);
  isLoading = signal(false);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getPrice(product: Product): string {
    return '$' + product.price.toFixed(0);
  }
}
