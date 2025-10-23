import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-order-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col gap-4 lg:gap-6 overflow-hidden p-3 lg:p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl lg:text-3xl font-bold text-white">📝 Nouvelle Commande</h1>
        <button 
          (click)="goBack()"
          class="text-neutral-400 hover:text-white text-sm lg:text-base">
          ← Retour
        </button>
      </div>

      <!-- Main Content: Two Column Layout on Desktop, Stacked on Mobile -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 overflow-hidden">
        
        <!-- Left: Order Config & Products (2/3 width) -->
        <div class="lg:col-span-2 flex flex-col gap-4 lg:gap-6 overflow-hidden">
          
          <!-- Order Type Selection -->
          <div class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <h3 class="text-lg font-bold text-white mb-3">Type de commande</h3>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  [(ngModel)]="orderType" 
                  value="TABLE"
                  (change)="onOrderTypeChange()"
                  class="w-4 h-4 accent-primary">
                <span class="text-white text-sm lg:text-base">🪑 Table</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  [(ngModel)]="orderType" 
                  value="TAKEAWAY"
                  (change)="onOrderTypeChange()"
                  class="w-4 h-4 accent-primary">
                <span class="text-white text-sm lg:text-base">🛍️ À Emporter</span>
              </label>
            </div>
          </div>

          <!-- Table Selection -->
          <div *ngIf="orderType === 'TABLE'" class="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <label class="block text-white font-semibold mb-2 text-sm lg:text-base">Table:</label>
            <select 
              [(ngModel)]="selectedTableId" 
              class="w-full bg-neutral-700 text-white rounded-lg p-2 lg:p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm lg:text-base">
              <option value="">-- Sélectionnez une table --</option>
              <option *ngFor="let table of availableTables()" [value]="table.publicId">
                {{ table.number }} - {{ table.name }} ({{ table.capacity }} places)
              </option>
            </select>
            <p *ngIf="!selectedTableId()" class="text-red-400 text-xs lg:text-sm mt-1">⚠ Table requise</p>
          </div>

          <!-- Customer Info (TAKEAWAY) -->
          <div *ngIf="orderType === 'TAKEAWAY'" class="bg-neutral-800 rounded-lg p-4 border border-neutral-700 space-y-3">
            <div>
              <label class="block text-white font-semibold mb-1 text-sm lg:text-base">Nom du client:</label>
              <input 
                [(ngModel)]="customerName" 
                type="text"
                placeholder="Ex: Jean Dupont"
                class="w-full bg-neutral-700 text-white rounded-lg p-2 lg:p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-500 text-sm lg:text-base">
              <p *ngIf="!customerName()" class="text-red-400 text-xs lg:text-sm mt-1">⚠ Nom requis</p>
            </div>
            <div>
              <label class="block text-white font-semibold mb-1 text-sm lg:text-base">Téléphone:</label>
              <input 
                [(ngModel)]="customerPhone" 
                type="tel"
                placeholder="Ex: +221 77 123 45 67"
                class="w-full bg-neutral-700 text-white rounded-lg p-2 lg:p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-500 text-sm lg:text-base">
            </div>
          </div>

          <!-- Menus Section -->
          <div class="flex-1 flex flex-col gap-3 overflow-hidden bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <h3 class="text-base lg:text-lg font-bold text-white">🍽️ Menus</h3>
            
            <!-- Search -->
            <div>
              <input 
                [(ngModel)]="searchTerm" 
                (input)="filterProducts()"
                type="text"
                placeholder="Rechercher un menu..."
                class="w-full bg-neutral-700 text-white rounded-lg p-2 lg:p-3 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-500 text-sm">
            </div>

            <!-- Menus Grid -->
            <div class="flex-1 overflow-y-auto pr-2">
              <div *ngIf="isLoadingProducts()" class="flex justify-center items-center h-full">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>

              <div *ngIf="!isLoadingProducts() && filteredProducts().length === 0" class="flex justify-center items-center h-full">
                <p class="text-neutral-400 text-center">Aucun menu trouvé</p>
              </div>

              <div *ngIf="!isLoadingProducts() && filteredProducts().length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                <button 
                  *ngFor="let product of filteredProducts()"
                  (click)="addProductToCart(product)"
                  type="button"
                  class="bg-neutral-700 hover:bg-primary hover:text-white transition rounded-lg p-2 text-center text-white text-xs transform hover:scale-105">
                  <div class="w-full h-16 bg-neutral-600 rounded mb-1 flex items-center justify-center overflow-hidden">
                    <img 
                      *ngIf="getImageUrl(product)" 
                      [src]="getImageUrl(product)" 
                      alt="{{ product.name }}"
                      class="w-full h-full object-cover">
                    <span *ngIf="!getImageUrl(product)" class="text-neutral-400">📷</span>
                  </div>
                  <p class="font-semibold line-clamp-2 mb-1">{{ product.name }}</p>
                  <p class="text-primary font-bold">FCFA {{ (product.price / 100).toFixed(0) }}</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Cart (1/3 width) -->
        <div class="lg:col-span-1 flex flex-col gap-3 overflow-hidden bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div class="flex justify-between items-center">
            <h3 class="text-base lg:text-lg font-bold text-white">🛒 Panier</h3>
            <span class="text-primary font-bold text-sm">{{ cartItems().length }}</span>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto space-y-2 pb-2">
            <div *ngIf="cartItems().length === 0" class="flex items-center justify-center h-full">
              <p class="text-neutral-400 text-center text-sm">Panier vide</p>
            </div>

            <div *ngFor="let item of cartItems()" class="bg-neutral-700 rounded p-2 lg:p-3 flex justify-between items-start gap-2 text-xs lg:text-sm">
              <div class="flex-1 min-w-0">
                <p class="text-white font-semibold truncate">{{ item.name }}</p>
                <p class="text-neutral-400">x{{ item.quantity }}</p>
                <p class="text-primary font-bold">FCFA {{ ((item.price / 100) * item.quantity).toFixed(0) }}</p>
              </div>
              <button 
                (click)="removeFromCart(item.productId)"
                type="button"
                class="text-red-400 hover:text-red-300 font-bold flex-shrink-0">
                ✕
              </button>
            </div>
          </div>

          <!-- Total & Actions -->
          <div class="border-t border-neutral-600 pt-3 space-y-2">
            <div class="flex justify-between items-center text-white text-sm lg:text-base">
              <span class="font-semibold">Total:</span>
              <span class="text-primary font-bold text-lg">FCFA {{ (cartTotal() / 100).toFixed(0) }}</span>
            </div>

            <button 
              (click)="clearCart()"
              type="button"
              [disabled]="cartItems().length === 0"
              class="w-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-neutral-300 hover:text-white font-semibold py-2 rounded-lg transition text-xs lg:text-sm">
              Vider
            </button>

            <button 
              (click)="submitOrder()"
              type="button"
              [disabled]="!canSubmitOrder() || isSubmitting()"
              class="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition text-sm lg:text-base flex items-center justify-center gap-2">
              <span *ngIf="!isSubmitting()">✓ Enregistrer</span>
              <span *ngIf="isSubmitting()">⏳ En cours...</span>
            </button>

            <p *ngIf="!canSubmitOrder() && cartItems().length > 0" class="text-red-400 text-xs text-center">
              {{ orderType === 'TABLE' ? '⚠ Choisir une table' : '⚠ Entrer un nom' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrderEntryComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Order Type
  orderType = 'TABLE';

  // Tables
  availableTables = signal<any[]>([]);
  selectedTableId = signal<string>('');

  // Customer Info (for takeaway)
  customerName = signal<string>('');
  customerPhone = signal<string>('');

  // Products and Menus
  isLoadingProducts = signal(false);
  allProducts = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  selectedCategory = signal<any>('');
  searchTerm = signal<string>('');
  imageUrls = signal<{ [key: string]: string }>({});

  // Cart
  cartItems = signal<any[]>([]);
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadTables();
    this.loadMenusAndProducts();
    this.loadCategories();
  }

  loadTables(): void {
    this.apiService.getAvailableTables().subscribe({
      next: (tables) => {
        console.log('Tables chargées:', tables);
        const tableList = Array.isArray(tables) ? tables : [];
        this.availableTables.set(tableList);
        if (tableList.length === 0) {
          this.toast.warning('Aucune table disponible');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tables:', err);
        this.toast.error('Impossible de charger les tables');
      }
    });
  }

  /**
   * Charge les MENUS à vendre (combos complets)
   */
  loadMenusAndProducts(): void {
    this.isLoadingProducts.set(true);

    this.apiService.getAllMenus(0, 100).subscribe({
      next: (menus) => {
        const menuList = Array.isArray(menus) ? menus : [];
        
        const menusAsProducts = menuList
          .filter((menu: any) => menu.active !== false && menu.bundlePrice)
          .map((menu: any) => ({
            publicId: menu.publicId,
            name: menu.name,
            description: menu.description,
            price: menu.bundlePrice,
            imageUrl: menu.imageUrl,
            categoryId: 'MENUS',
            isMenu: true,
            menuPublicId: menu.publicId,
            menuItems: menu.menuItems || []
          }));
        
        this.allProducts.set(menusAsProducts);
        this.filteredProducts.set(menusAsProducts);
        this.loadMenuImages(menuList);
        this.isLoadingProducts.set(false);
        
        if (menuList.length === 0) {
          this.toast.warning('Aucun menu disponible');
        }
      },
      error: (err) => {
        console.error('Erreur chargement menus:', err);
        this.toast.error('Impossible de charger les menus');
        this.isLoadingProducts.set(false);
      }
    });
  }

  loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.apiService.getProducts().subscribe({
      next: (products) => {
        console.log('Produits chargés:', products);
        const productList = Array.isArray(products) ? products : [];
        this.allProducts.set(productList);
        this.filteredProducts.set(productList);
        this.isLoadingProducts.set(false);
        if (productList.length === 0) {
          this.toast.warning('Aucun produit disponible');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.toast.error('Impossible de charger les produits');
        this.isLoadingProducts.set(false);
      }
    });
  }

  loadMenuImages(menus: any[]): void {
    const urls: { [key: string]: string } = {};
    menus.forEach(menu => {
      if (menu.imageUrl) {
        this.apiService.getImageAsDataUrl(menu.imageUrl).subscribe({
          next: (url) => {
            urls[menu.publicId] = url;
            this.imageUrls.set({ ...this.imageUrls(), ...urls });
          },
          error: () => {
            // Image loading error - will show placeholder
          }
        });
      }
    });
  }

  getImageUrl(product: any): string {
    return this.imageUrls()[product.publicId] || '';
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        console.log('Catégories chargées:', categories);
        const categoryList = Array.isArray(categories) ? categories : [];
        this.categories.set(categoryList);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.toast.error('Impossible de charger les catégories');
      }
    });
  }

  onOrderTypeChange(): void {
    if (this.orderType === 'TABLE') {
      this.customerName.set('');
      this.customerPhone.set('');
    } else {
      this.selectedTableId.set('');
    }
  }

  filterProducts(): void {
    let filtered = this.allProducts();

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
    const existingItem = cart.find(item => item.itemId === product.publicId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        itemId: product.publicId,
        menuPublicId: product.isMenu ? product.publicId : undefined,
        name: product.name,
        price: product.price,
        quantity: 1,
        isMenu: product.isMenu || false,
        menuItems: product.menuItems || []
      });
    }

    this.cartItems.set(cart);
    this.toast.info(`${product.name} ajouté au panier`, 2000);
  }

  removeFromCart(itemId: string): void {
    const cart = this.cartItems().filter(item => item.itemId !== itemId);
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
    if (!this.canSubmitOrder()) {
      this.toast.warning('Veuillez remplir tous les champs requis');
      return;
    }

    this.isSubmitting.set(true);

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
        const orderRequest: any = {
          customerSessionPublicId: session.publicId,
          orderType: this.orderType,
          items: this.cartItems().map(item => ({
            menuItemPublicId: item.menuPublicId || item.itemId,
            quantity: item.quantity
          }))
        };

        if (this.orderType === 'TABLE') {
          orderRequest.tablePublicId = this.selectedTableId();
        }

        this.apiService.createOrder(orderRequest).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toast.success('✓ Commande enregistrée avec succès!');
            this.clearCart();
            this.selectedTableId.set('');
            this.customerName.set('');
            this.customerPhone.set('');
            setTimeout(() => {
              this.router.navigate(['/pos/pending-orders']);
            }, 1500);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            console.error('Erreur lors de la création de commande:', err);
            const errorMsg = err.error?.message || 'Erreur lors de la création de la commande';
            this.toast.error(errorMsg);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erreur lors de la création de session:', err);
        const errorMsg = err.error?.message || 'Erreur lors de la création de la session';
        this.toast.error(errorMsg);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pos']);
  }
}
