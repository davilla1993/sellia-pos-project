import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <style>
      .image-zoom {
        transition: transform 0.3s ease;
      }
      .image-zoom:hover {
        transform: scale(4);
        z-index: 10;
        position: relative;
      }
    </style>
    
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Catalogue de Produits</h1>
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

      <!-- Products Table -->
      <div *ngIf="!isLoading() && products().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table class="w-full">
          <thead class="bg-neutral-700 border-b border-neutral-600">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Image</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Nom</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Prix</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Stock</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of paginatedProducts()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
              <!-- Image -->
              <td class="px-6 py-4">
                <div class="w-12 h-12 rounded-lg bg-neutral-700 overflow-hidden flex items-center justify-center">
                  <img *ngIf="getImageUrl(product)" 
                    [src]="getImageUrl(product)" 
                    alt="{{ product.name }}"
                    class="image-zoom w-12 h-12 object-cover cursor-pointer rounded-lg"
                    title="Cliquez pour zoomer">
                  <svg *ngIf="!getImageUrl(product)" class="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </td>

              <!-- Nom -->
              <td class="px-6 py-4">
                <div>
                  <p class="text-white font-semibold">{{ product.name }}</p>
                  <p class="text-xs text-neutral-400 truncate">{{ product.description }}</p>
                </div>
              </td>

              <!-- Prix -->
              <td class="px-6 py-4">
                <span class="text-lg font-bold text-primary">€{{ (product.price / 100).toFixed(2) }}</span>
              </td>

              <!-- Stock -->
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                  [class]="product.stock > 0 ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'">
                  {{ product.stock }} unités
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 space-x-2 flex">
                <a [routerLink]="[product.publicId, 'edit']" class="text-primary hover:text-primary-dark text-sm font-medium">Éditer</a>
                <button (click)="deleteProduct(product.publicId)" class="text-red-400 hover:text-red-300 text-sm font-medium">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div *ngIf="!isLoading() && products().length > 0" class="flex justify-center items-center gap-3 bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <button (click)="previousPage()" [disabled]="currentPage() === 1" class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-300 rounded font-medium">
          ← Précédent
        </button>
        <div class="flex gap-1">
          <button *ngFor="let page of getPageNumbers()" 
            (click)="goToPage(page)"
            [class.bg-primary]="currentPage() === page"
            [class.bg-neutral-700]="currentPage() !== page"
            [class.text-white]="currentPage() === page"
            [class.text-neutral-300]="currentPage() !== page"
            class="w-8 h-8 rounded font-semibold transition-colors text-sm">
            {{ page }}
          </button>
        </div>
        <button (click)="nextPage()" [disabled]="currentPage() === totalPages()" class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-300 rounded font-medium">
          Suivant →
        </button>
        <span class="text-neutral-400 text-sm ml-2">{{ currentPage() }} / {{ totalPages() }} ({{ products().length }} produits)</span>
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
  currentPage = signal(1);
  itemsPerPage = 10;
  imageUrls = signal<{ [key: string]: string }>({});

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiService.getAllProductsAdmin(0, 50).subscribe({
      next: (data) => {
        const loadedProducts = Array.isArray(data) ? data : data.content || [];
        this.products.set(loadedProducts);
        this.loadImages(loadedProducts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des produits');
        this.isLoading.set(false);
      }
    });
  }

  loadImages(products: any[]): void {
    const urls: { [key: string]: string } = {};
    
    products.forEach(product => {
      if (product.imageUrl) {
        this.apiService.getImageAsDataUrl(product.imageUrl).subscribe({
          next: (url) => {
            urls[product.publicId] = url;
            this.imageUrls.set({ ...this.imageUrls(), ...urls });
          },
          error: () => {
            // Image loading error, will use placeholder
          }
        });
      }
    });
  }

  getImageUrl(product: any): string {
    return this.imageUrls()[product.publicId] || '';
  }

  deleteProduct(publicId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      this.apiService.deleteProduct(publicId).subscribe({
        next: () => this.loadProducts(),
        error: () => this.error.set('Erreur lors de la suppression')
      });
    }
  }

  totalPages(): number {
    return Math.ceil(this.products().length / this.itemsPerPage);
  }

  paginatedProducts() {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.products().slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, current + 2);
    
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(total, 5);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
