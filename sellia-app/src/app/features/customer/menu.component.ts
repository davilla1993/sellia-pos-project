import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../shared/models/types';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="section-header">
        <h1 class="section-title">Our Menu</h1>
        <p class="section-subtitle">Explore our delicious offerings</p>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-xl shadow-elegant p-6 mb-8">
        <form [formGroup]="searchForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Search Input -->
            <div>
              <label class="block text-sm font-semibold text-dark mb-2">Search Dishes</label>
              <input
                type="text"
                formControlName="searchTerm"
                class="input-field"
                placeholder="Search by name..."
              />
            </div>

            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-semibold text-dark mb-2">Category</label>
              <select
                formControlName="category"
                class="input-field"
              >
                <option value="">All Categories</option>
                <option value="appetizers">Appetizers</option>
                <option value="mains">Main Courses</option>
                <option value="desserts">Desserts</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let product of filteredProducts()"
          class="card card-hover"
          [routerLink]="['/customer/order', product.publicId]"
        >
          <!-- Product Image -->
          <div class="w-full h-48 bg-neutral-200 rounded-lg overflow-hidden mb-4">
            <img
              *ngIf="product.imageUrl"
              [src]="product.imageUrl"
              alt="{{ product.name }}"
              class="w-full h-full object-cover"
            />
            <div *ngIf="!product.imageUrl" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-neutral-200">
              <span class="text-neutral-500">No Image</span>
            </div>
          </div>

          <!-- Product Info -->
          <h3 class="text-xl font-semibold text-dark mb-2">{{ product.name }}</h3>
          <p class="text-neutral-600 text-sm mb-4 line-clamp-2">{{ product.description }}</p>

          <!-- Price & Status -->
          <div class="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200">
            <span class="text-2xl font-bold text-primary">${{ product.price.toFixed(2) }}</span>
            <span
              *ngIf="!product.available"
              class="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full"
            >
              Unavailable
            </span>
            <button
              *ngIf="product.available"
              class="btn-primary text-sm py-2 px-4"
              (click)="addToCart(product)"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf="!isLoading() && filteredProducts().length === 0" class="text-center py-12">
        <p class="text-neutral-600 text-lg">No dishes found. Try adjusting your search.</p>
      </div>

      <!-- Cart Summary (Floating) -->
      <div *ngIf="cartItems().length > 0" class="fixed bottom-6 right-6 bg-primary text-white rounded-lg shadow-elevation p-4 animate-slide-up">
        <p class="text-sm font-semibold mb-2">{{ cartItems().length }} item{{ cartItems().length > 1 ? 's' : '' }} in cart</p>
        <button
          routerLink="/customer/checkout"
          class="w-full bg-white text-primary font-semibold py-2 rounded-lg hover:bg-neutral-100 transition"
        >
          Checkout
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class MenuComponent implements OnInit {
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  cartItems = signal<Product[]>([]);
  isLoading = signal(false);
  searchForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      category: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupSearchFilter();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.isLoading.set(false);
      }
    });
  }

  setupSearchFilter(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.filterProducts());
  }

  filterProducts(): void {
    const { searchTerm, category } = this.searchForm.value;
    let filtered = this.products();

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.categoryId === category);
    }

    this.filteredProducts.set(filtered);
  }

  addToCart(product: Product): void {
    const currentCart = this.cartItems();
    currentCart.push(product);
    this.cartItems.set([...currentCart]);
  }
}
