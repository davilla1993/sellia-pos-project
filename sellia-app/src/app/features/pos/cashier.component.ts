import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface CartItem {
  publicId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-full gap-6 p-6 bg-neutral-900 overflow-hidden">
      <!-- LEFT: Products & Categories -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-white">Nouvelle Commande</h1>
          <button (click)="resetCart()" *ngIf="cartItems().length > 0" class="text-red-400 hover:text-red-300 font-medium">
            ✕ Annuler
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <svg class="absolute left-4 top-3 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input [(ngModel)]="searchQuery" (ngModelChange)="resetPagination()" type="text" placeholder="Rechercher un produit..." class="input-field bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 pl-12">
        </div>

        <!-- Categories -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button (click)="selectCategory(null)"
            [class.bg-primary]="!selectedCategory()"
            [class.bg-neutral-700]="selectedCategory()"
            [class.text-white]="!selectedCategory()"
            [class.text-neutral-300]="selectedCategory()"
            class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors">
            Tous
          </button>
          <button *ngFor="let cat of categories()" 
            (click)="selectCategory(cat.id)"
            [class.bg-primary]="selectedCategory() === cat.id"
            [class.bg-neutral-700]="selectedCategory() !== cat.id"
            [class.text-white]="selectedCategory() === cat.id"
            [class.text-neutral-300]="selectedCategory() !== cat.id"
            class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors">
            {{ cat.name }}
          </button>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="isLoadingProducts()" class="flex justify-center items-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>

          <div *ngIf="!isLoadingProducts() && paginatedProducts().length > 0" class="grid grid-cols-2 gap-4 pb-4">
            <div *ngFor="let product of paginatedProducts()" 
              (click)="addToCart(product)"
              class="bg-neutral-800 rounded-lg border border-neutral-700 hover:border-primary cursor-pointer transition-all hover:shadow-lg overflow-hidden">
              <!-- Image -->
              <div class="h-32 bg-neutral-700 overflow-hidden">
                <img *ngIf="product.imageUrl" [src]="product.imageUrl" alt="{{ product.name }}" class="w-full h-full object-cover">
                <div *ngIf="!product.imageUrl" class="w-full h-full flex items-center justify-center text-neutral-500">
                  📦
                </div>
              </div>
              <!-- Info -->
              <div class="p-3">
                <h3 class="text-sm font-bold text-white truncate">{{ product.name }}</h3>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-lg font-bold text-primary">FCFA {{ (product.price / 100).toFixed(0) }}</span>
                  <span class="text-xs" [class]="product.stock > 0 ? 'text-green-400' : 'text-red-400'">
                    {{ product.stock }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoadingProducts() && filteredProducts().length === 0" class="flex items-center justify-center h-full text-neutral-400">
            Aucun produit trouvé
          </div>
        </div>

        <!-- Pagination Controls -->
        <div *ngIf="!isLoadingProducts() && filteredProducts().length > 0" class="flex justify-center items-center gap-3 bg-neutral-800 rounded-lg p-3 border border-neutral-700">
          <button (click)="previousPage()" [disabled]="currentPage() === 1" class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-300 rounded font-medium">
            ← Prev
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
            Next →
          </button>
          <span class="text-neutral-400 text-sm ml-2">{{ currentPage() }} / {{ totalPages() }}</span>
        </div>
      </div>

      <!-- RIGHT: Cart & Payment -->
      <div class="w-96 flex flex-col gap-4 overflow-hidden">
        <!-- Cart Title -->
        <h2 class="text-2xl font-bold text-white">Panier ({{ cartItems().length }})</h2>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto bg-neutral-800 rounded-lg border border-neutral-700 p-4 space-y-3">
          <div *ngIf="cartItems().length === 0" class="text-center py-12 text-neutral-400">
            Panier vide
          </div>

          <div *ngFor="let item of cartItems(); let i = index" class="bg-neutral-700 rounded p-3 space-y-2">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-semibold text-white">{{ item.name }}</p>
                <p class="text-sm text-neutral-300">FCFA {{ (item.price / 100).toFixed(0) }} x {{ item.quantity }}</p>
              </div>
              <button (click)="removeFromCart(i)" class="text-red-400 hover:text-red-300 font-bold">✕</button>
            </div>
            <!-- Quantity Controls -->
            <div class="flex gap-2 items-center justify-between">
              <div class="flex gap-1 bg-neutral-600 rounded px-2 py-1">
                <button (click)="decrementQuantity(i)" class="text-neutral-300 hover:text-white font-bold">−</button>
                <span class="px-2 text-white font-semibold">{{ item.quantity }}</span>
                <button (click)="incrementQuantity(i)" class="text-neutral-300 hover:text-white font-bold">+</button>
              </div>
              <span class="font-bold text-primary">FCFA {{ (item.price * item.quantity / 100).toFixed(0) }}</span>
            </div>
          </div>
        </div>

        <!-- Totals Section -->
        <div class="bg-neutral-800 rounded-lg border border-neutral-700 p-4 space-y-3">
          <div class="flex justify-between text-neutral-300">
            <span>Sous-total:</span>
            <span>FCFA {{ (subtotal() / 100).toFixed(0) }}</span>
          </div>

          <!-- Discount -->
          <div class="space-y-2">
            <label class="text-sm text-neutral-400">Réduction (%)</label>
            <div class="flex gap-2">
              <input [(ngModel)]="discountPercent" type="number" min="0" max="100" class="flex-1 input-field bg-neutral-700 border-neutral-600 text-white text-sm" placeholder="0">
              <button (click)="applyDiscount()" class="px-4 py-2 bg-primary hover:bg-primary-dark rounded font-semibold text-white text-sm">Appliquer</button>
            </div>
            <p *ngIf="discountAmount() > 0" class="text-sm text-yellow-400">
              -FCFA {{ (discountAmount() / 100).toFixed(0) }}
            </p>
          </div>

          <div class="border-t border-neutral-600 pt-3">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold text-white">Total:</span>
              <span class="text-3xl font-bold text-primary">FCFA {{ (total() / 100).toFixed(0) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-neutral-300">Mode de paiement</label>
          <div class="grid grid-cols-3 gap-2">
            <button *ngFor="let method of paymentMethods"
              (click)="selectPaymentMethod(method.id)"
              [class.bg-primary]="selectedPaymentMethod() === method.id"
              [class.bg-neutral-700]="selectedPaymentMethod() !== method.id"
              [class.text-white]="selectedPaymentMethod() === method.id"
              [class.text-neutral-300]="selectedPaymentMethod() !== method.id"
              class="py-2 rounded font-medium transition-colors text-sm">
              {{ method.icon }} {{ method.label }}
            </button>
          </div>
        </div>

        <!-- Cash Payment Amount -->
        <div *ngIf="selectedPaymentMethod() === 'especes'" class="space-y-2 bg-neutral-800 rounded-lg border border-neutral-700 p-3">
          <label class="text-sm font-semibold text-neutral-300">Montant remis (FCFA)</label>
          <input [(ngModel)]="amountPaid" (ngModelChange)="updateAmountPaid($event)" type="number" min="0" step="100" class="w-full input-field bg-neutral-700 border-neutral-600 text-white text-sm" placeholder="0">
          <div class="space-y-2 pt-2 border-t border-neutral-600">
            <div class="flex justify-between text-neutral-300">
              <span>Rendu:</span>
              <span [class]="amountPaid() >= total() ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                FCFA {{ (changeAmount() / 100).toFixed(0) }}
              </span>
            </div>
            <p *ngIf="amountPaid() < total()" class="text-xs text-red-400">
              Montant insuffisant: manque FCFA {{ ((total() - amountPaid()) / 100).toFixed(0) }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button (click)="resetCart()" class="flex-1 btn-outline py-3 font-semibold">Annuler</button>
          <button (click)="completeOrder()" [disabled]="cartItems().length === 0 || !isAmountSufficient()" class="flex-1 btn-primary py-3 font-semibold" [class.opacity-50]="cartItems().length === 0 || !isAmountSufficient()">
            Valider (FCFA {{ (total() / 100).toFixed(0) }})
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CashierComponent implements OnInit {
  private apiService = inject(ApiService);

  products = signal<any[]>([]);
  cartItems = signal<CartItem[]>([]);
  searchQuery = signal('');
  selectedCategory = signal<number | null>(null);
  selectedPaymentMethod = signal('especes');
  discountPercent = signal(0);
  discountAmount = signal(0);
  amountPaid = signal(0);
  changeAmount = signal(0);
  isLoadingProducts = signal(false);
  currentPage = signal(1);
  itemsPerPage = 10;
  categories = signal<any[]>([]);
  paymentMethods: PaymentMethod[] = [
    { id: 'especes', label: 'Espèces', icon: '💵' },
    { id: 'carte', label: 'Carte', icon: '💳' },
    { id: 'online', label: 'En ligne', icon: '📱' }
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (data: any) => {
        const cats = Array.isArray(data) ? data : data.content || [];
        this.categories.set(cats);
      },
      error: () => {
        // Erreur silencieuse
      }
    });
  }

  loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.apiService.getAllProductsAdmin(0, 100).subscribe({
      next: (data) => {
        this.products.set(Array.isArray(data) ? data : data.content || []);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.isLoadingProducts.set(false);
      }
    });
  }

  filteredProducts() {
    const query = this.searchQuery().toLowerCase();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(query) &&
      (!this.selectedCategory() || p.categoryId === this.selectedCategory())
    );
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

  resetPagination(): void {
    this.currentPage.set(1);
  }

  selectCategory(catId: number | null): void {
    this.selectedCategory.set(catId);
    this.resetPagination();
  }

  addToCart(product: any): void {
    if (product.stock <= 0) return;

    const existing = this.cartItems().find(item => item.publicId === product.publicId);
    if (existing) {
      this.incrementQuantity(this.cartItems().indexOf(existing));
    } else {
      this.cartItems.update(items => [...items, {
        publicId: product.publicId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      }]);
    }
  }

  removeFromCart(index: number): void {
    this.cartItems.update(items => items.filter((_, i) => i !== index));
  }

  incrementQuantity(index: number): void {
    this.cartItems.update(items => {
      const updated = [...items];
      updated[index].quantity++;
      return updated;
    });
  }

  decrementQuantity(index: number): void {
    this.cartItems.update(items => {
      const updated = [...items];
      if (updated[index].quantity > 1) {
        updated[index].quantity--;
      }
      return updated;
    });
  }

  subtotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  applyDiscount(): void {
    const subtotal = this.subtotal();
    this.discountAmount.set(Math.round(subtotal * this.discountPercent() / 100));
  }

  total(): number {
    return Math.max(0, this.subtotal() - this.discountAmount());
  }

  updateAmountPaid(amount: number): void {
    this.amountPaid.set(amount * 100);
    this.calculateChange();
  }

  calculateChange(): void {
    const change = this.amountPaid() - this.total();
    this.changeAmount.set(Math.max(0, change));
  }

  isAmountSufficient(): boolean {
    return this.selectedPaymentMethod() !== 'especes' || this.amountPaid() >= this.total();
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod.set(method);
  }

  completeOrder(): void {
    if (this.cartItems().length === 0) return;

    const order = {
      items: this.cartItems().map(item => ({
        productId: item.publicId,
        quantity: item.quantity
      })),
      subtotal: this.subtotal(),
      discount: this.discountAmount(),
      total: this.total(),
      paymentMethod: this.selectedPaymentMethod(),
      timestamp: new Date().toISOString()
    };

    console.log('Commande complétée:', order);
    alert(`Commande validée!\nTotal: FCFA ${(order.total / 100).toFixed(0)}`);
    this.resetCart();
  }

  resetCart(): void {
    this.cartItems.set([]);
    this.discountPercent.set(0);
    this.discountAmount.set(0);
    this.amountPaid.set(0);
    this.changeAmount.set(0);
  }
}

