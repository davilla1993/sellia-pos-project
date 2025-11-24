import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-order-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-entry.component.html',
  styleUrls: ['./order-entry.component.css']
})
export class OrderEntryComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  // Check if user is ADMIN (read-only mode)
  isAdmin = signal(this.authService.hasRole('ADMIN'));

  // Order Type
  orderType = 'TABLE';

  // Tables
  availableTables = signal<any[]>([]);
  selectedTableId = signal<string>('');

  // Customer Info (for takeaway)
  customerName = signal<string>('');
  customerPhone = signal<string>('');

  // Order Notes
  orderNotes = signal<string>('');

  // Products and Menus
  isLoadingProducts = signal(false);
  allProducts = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  selectedCategory = signal<any>('');
  selectedMenuType = signal<string>('all');
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
            menuType: menu.menuType,
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

    // Filter by menu type
    const selectedType = this.selectedMenuType();
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.menuType === selectedType);
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

  selectMenuType(type: string): void {
    this.selectedMenuType.set(type);
    this.filterProducts();
  }

  getStandardCount(): number {
    return this.allProducts().filter(m => m.menuType === 'STANDARD').length;
  }

  getVipCount(): number {
    return this.allProducts().filter(m => m.menuType === 'VIP').length;
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
      // For TAKEAWAY, no fields are required - customer info is optional
      return true;
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
          items: this.cartItems().map(item => {
            const orderItem: any = {
              quantity: item.quantity
            };
            if (item.isMenu && item.menuPublicId) {
              orderItem.menuPublicId = item.menuPublicId;
            } else {
              orderItem.menuItemPublicId = item.itemId;
            }
            return orderItem;
          })
        };

        if (this.orderType === 'TABLE') {
          orderRequest.tablePublicId = this.selectedTableId();
        }

        // Ajouter les notes si présentes
        if (this.orderNotes().trim()) {
          orderRequest.notes = this.orderNotes();
        }

        // Ajouter les infos client pour TAKEAWAY
        if (this.orderType === 'TAKEAWAY') {
          orderRequest.customerName = this.customerName();
          orderRequest.customerPhone = this.customerPhone();
        }

        this.apiService.createOrder(orderRequest).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toast.success('✓ Commande enregistrée avec succès!');
            this.clearCart();
            this.selectedTableId.set('');
            this.customerName.set('');
            this.customerPhone.set('');
            this.orderNotes.set('');
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
