import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Gestion des Produits</h1>
          <p class="text-neutral-400">Gérez votre catalogue de produits</p>
        </div>
        <a routerLink="add" class="btn-primary">+ Nouveau Produit</a>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
        {{ error() }}
      </div>

      <!-- Products Grid -->
      <div *ngIf="!isLoading() && products().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let product of products()" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden hover:border-primary transition-colors">
          <!-- Product Image -->
          <div class="h-48 bg-neutral-700 overflow-hidden">
            <img *ngIf="product.imageUrl" [src]="product.imageUrl" alt="{{ product.name }}" class="w-full h-full object-cover">
            <div *ngIf="!product.imageUrl" class="w-full h-full flex items-center justify-center text-neutral-500">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4 space-y-3">
            <div>
              <h3 class="text-lg font-bold text-white">{{ product.name }}</h3>
              <p class="text-sm text-neutral-400">{{ product.description }}</p>
            </div>

            <div class="flex justify-between items-center py-2 border-t border-neutral-700">
              <div>
                <p class="text-xs text-neutral-500">Prix</p>
                <p class="text-xl font-bold text-primary">€{{ (product.price / 100).toFixed(2) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-neutral-500">Stock</p>
                <p class="text-xl font-bold" [class]="product.stock > 0 ? 'text-green-400' : 'text-red-400'">
                  {{ product.stock }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <a [routerLink]="[product.publicId, 'edit']" class="flex-1 btn-secondary text-center text-sm">Éditer</a>
              <button (click)="deleteProduct(product.publicId)" class="flex-1 btn-danger text-sm">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && products().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
        <p class="text-neutral-400 mb-4">Aucun produit trouvé</p>
        <a routerLink="add" class="text-primary hover:text-primary-dark font-medium">Ajouter le premier produit</a>
      </div>
    </div>
  `,
  styles: []
})
export class ProductsListComponent implements OnInit {
  private apiService = inject(ApiService);

  products = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiService.getAllProductsAdmin(0, 50).subscribe({
      next: (data) => {
        this.products.set(Array.isArray(data) ? data : data.content || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des produits');
        this.isLoading.set(false);
      }
    });
  }

  deleteProduct(publicId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      this.apiService.deleteProduct(publicId).subscribe({
        next: () => this.loadProducts(),
        error: () => this.error.set('Erreur lors de la suppression')
      });
    }
  }
}
