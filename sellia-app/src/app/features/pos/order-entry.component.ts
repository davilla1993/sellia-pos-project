import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-order-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col gap-6 overflow-hidden">
      <!-- Order Type Selection -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h2 class="text-2xl font-bold text-white mb-4">📝 Nouvelle Commande</h2>
        
        <div class="flex gap-4 mb-6">
          <label class="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              [(ngModel)]="orderType" 
              value="TABLE"
              (change)="onOrderTypeChange()"
              class="w-5 h-5 accent-primary">
            <span class="text-white font-semibold">🪑 Table</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              [(ngModel)]="orderType" 
              value="TAKEAWAY"
              (change)="onOrderTypeChange()"
              class="w-5 h-5 accent-primary">
            <span class="text-white font-semibold">🛍️ À Emporter</span>
          </label>
        </div>

        <!-- Table Selection (for TABLE orders) -->
        <div *ngIf="orderType === 'TABLE'" class="mb-4">
          <label class="block text-white font-semibold mb-2">Sélectionner une table:</label>
          <select 
            [(ngModel)]="selectedTableId" 
            class="w-full bg-neutral-700 text-white rounded-lg p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">-- Choisir une table --</option>
            <option *ngFor="let table of availableTables()" [value]="table.publicId">
              {{ table.number }} - {{ table.name }}
            </option>
          </select>
        </div>

        <!-- Customer Info (for TAKEAWAY orders) -->
        <div *ngIf="orderType === 'TAKEAWAY'" class="space-y-4">
          <div>
            <label class="block text-white font-semibold mb-2">Nom du client:</label>
            <input 
              [(ngModel)]="customerName" 
              type="text"
              placeholder="Nom du client"
              class="w-full bg-neutral-700 text-white rounded-lg p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-400">
          </div>
          <div>
            <label class="block text-white font-semibold mb-2">Téléphone (optionnel):</label>
            <input 
              [(ngModel)]="customerPhone" 
              type="tel"
              placeholder="Numéro de téléphone"
              class="w-full bg-neutral-700 text-white rounded-lg p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-400">
          </div>
        </div>
      </div>

      <!-- Products Selection -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 class="text-xl font-bold text-white">🍽️ Sélectionner les produits:</h3>
        
        <!-- Search & Category Filter -->
        <div class="space-y-2">
          <input 
            [(ngModel)]="searchTerm" 
            type="text"
            placeholder="🔍 Rechercher un produit..."
            class="w-full bg-neutral-700 text-white rounded-lg p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-400">
          
          <select 
            [(ngModel)]="selectedCategory" 
            (change)="filterProducts()"
            class="w-full bg-neutral-700 text-white rounded-lg p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Toutes les catégories</option>
            <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="isLoadingProducts()" class="flex justify-center items-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>

          <div *ngIf="!isLoadingProducts()" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <button 
              *ngFor="let product of filteredProducts()"
              (click)="addProductToCart(product)"
              class="bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg p-4 transition text-center">
              <div class="w-full h-24 bg-neutral-600 rounded mb-2 flex items-center justify-center overflow-hidden">
                <img 
                  *ngIf="product.imageUrl" 
                  [src]="product.imageUrl" 
                  alt="{{ product.name }}"
                  class="w-full h-full object-cover">
              </div>
              <p class="font-semibold mb-1 line-clamp-2">{{ product.name }}</p>
              <p class="text-primary font-bold">FCFA {{ (product.price / 100).toFixed(0) }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart & Submit -->
      <div class="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">🛒 Panier ({{ cartItems().length }} articles)</h3>
          <button 
            (click)="clearCart()"
            class="text-red-400 hover:text-red-300 font-semibold">
            Vider
          </button>
        </div>

        <!-- Cart Items -->
        <div class="max-h-48 overflow-y-auto mb-4 space-y-2">
          <div *ngFor="let item of cartItems()" class="bg-neutral-700 rounded p-3 flex justify-between items-center">
            <div>
              <p class="text-white font-semibold">{{ item.name }}</p>
              <p class="text-neutral-400 text-sm">x{{ item.quantity }}</p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-primary font-bold">FCFA {{ ((item.price / 100) * item.quantity).toFixed(0) }}</p>
              <button 
                (click)="removeFromCart(item.productId)"
                class="text-red-400 hover:text-red-300 font-bold">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Total & Submit -->
        <div class="bg-neutral-700 rounded p-4">
          <div class="flex justify-between items-center mb-4 text-white text-lg">
            <span class="font-semibold">Total:</span>
            <span class="text-primary font-bold">FCFA {{ (cartTotal() / 100).toFixed(0) }}</span>
          </div>

          <button 
            (click)="submitOrder()"
            [disabled]="!canSubmitOrder()"
            class="w-full bg-primary hover:bg-primary-dark disabled:bg-neutral-600 text-white font-bold py-3 rounded-lg transition">
            ✓ Enregistrer la Commande
          </button>

          <p *ngIf="!canSubmitOrder()" class="text-red-400 text-sm mt-2">
            {{ orderType === 'TABLE' ? 'Sélectionnez une table et ajoutez des produits' : 'Entrez un nom et ajoutez des produits' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrderEntryComponent implements OnInit {
  // Order Type
  orderType = 'TABLE'; // Using plain property, not signal for template binding

  // Tables
  availableTables = signal<any[]>([]);
  selectedTableId = signal<string>('');

  // Customer Info (for takeaway)
  customerName = signal<string>('');
  customerPhone = signal<string>('');

  // Products
  isLoadingProducts = signal(false);
  allProducts = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  selectedCategory = signal<any>('');
  searchTerm = signal<string>('');

  // Cart
  cartItems = signal<any[]>([]);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTables();
    this.loadProducts();
    this.loadCategories();
  }

  loadTables(): void {
    this.apiService.getTables().subscribe({
      next: (tables) => {
        this.availableTables.set(tables);
      }
    });
  }

  loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.filteredProducts.set(products);
        this.isLoadingProducts.set(false);
      }
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      }
    });
  }

  onOrderTypeChange(): void {
    // Reset fields when switching order type
    if (this.orderType === 'TABLE') {
      this.customerName.set('');
      this.customerPhone.set('');
    } else {
      this.selectedTableId.set('');
    }
  }

  filterProducts(): void {
    let filtered = this.allProducts();

    // Filter by category
    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategory());
    }

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    this.filteredProducts.set(filtered);
  }

  addProductToCart(product: any): void {
    const cart = [...this.cartItems()];
    const existingItem = cart.find(item => item.productId === product.publicId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        productId: product.publicId,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    this.cartItems.set(cart);
  }

  removeFromCart(productId: string): void {
    const cart = this.cartItems().filter(item => item.productId !== productId);
    this.cartItems.set(cart);
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  cartTotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  canSubmitOrder(): boolean {
    if (this.cartItems().length === 0) return false;

    if (this.orderType === 'TABLE') {
      return this.selectedTableId() !== '';
    } else {
      return this.customerName() !== '';
    }
  }

  submitOrder(): void {
    if (!this.canSubmitOrder()) return;

    // Create session first
    const sessionRequest = this.orderType === 'TABLE'
      ? {
          tablePublicId: this.selectedTableId(),
          orderType: 'TABLE'
        }
      : {
          customerName: this.customerName(),
          customerPhone: this.customerPhone(),
          orderType: 'TAKEAWAY'
        };

    this.apiService.createCustomerSession(sessionRequest).subscribe({
      next: (session) => {
        // Create order with cart items
        const orderRequest = {
          sessionPublicId: session.publicId,
          items: this.cartItems().map(item => ({
            productPublicId: item.productId,
            quantity: item.quantity
          }))
        };

        this.apiService.createOrder(orderRequest).subscribe({
          next: () => {
            // Success! Go to next screen or show confirmation
            alert('Commande enregistrée avec succès!');
            this.clearCart();
            this.selectedTableId.set('');
            this.customerName.set('');
            this.customerPhone.set('');
          },
          error: (err) => {
            console.error('Error creating order:', err);
            alert('Erreur lors de l\'enregistrement de la commande');
          }
        });
      },
      error: (err) => {
        console.error('Error creating session:', err);
        alert('Erreur lors de la création de la session');
      }
    });
  }
}
