import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  private apiService = inject(ApiService);

  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  searchTerm = signal<string>('');
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
        this.filteredProducts.set(loadedProducts);
        this.loadImages(loadedProducts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des produits');
        this.isLoading.set(false);
      }
    });
  }

  filterProducts(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.products());
      this.currentPage.set(1);
    } else {
      const filtered = this.products().filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
      this.filteredProducts.set(filtered);
      this.currentPage.set(1);
    }
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

  toggleAvailability(product: any): void {
    const newStatus = !product.available;
    this.apiService.toggleProductAvailability(product.publicId, newStatus).subscribe({
      next: () => {
        product.available = newStatus;
        this.error.set(null);
      },
      error: () => this.error.set('Erreur lors du changement de disponibilité')
    });
  }

  totalPages(): number {
    return Math.ceil(this.filteredProducts().length / this.itemsPerPage);
  }

  paginatedProducts() {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts().slice(start, end);
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
