import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MenuItem {
  publicId: string;
  menuName: string;
  itemName: string;
  price: number;
  description: string;
  preparationTime: number;
  isSpecial: boolean;
  specialDescription: string;
  imagePath?: string;
}

interface Category {
  publicId: string;
  name: string;
  description: string;
  items: MenuItem[];
}

interface CartItem {
  menuItemPublicId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-menu.component.html',
  styleUrls: ['./public-menu.component.css']
})
export class PublicMenuComponent implements OnInit {

  tablePublicId: string = '';
  customerSessionToken: string = '';
  tableNumber: string = '';
  isVip: boolean = false;
  loading: boolean = false;
  error: string = '';
  
  categories: any[] = [];
  allCategories: any[] = [];
  selectedCategory: string = '';
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  popularItems: MenuItem[] = [];
  searchQuery: string = '';
  
  cart: CartItem[] = [];
  cartTotal: number = 0;
  customerName: string = '';
  customerPhone: string = '';
  notes: string = '';
  
  showCart: boolean = false;
  submitting: boolean = false;
  orderSuccess: boolean = false;
  orderNumber: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Check for QR token in route params and redirect to table parameter
    this.route.params.subscribe(params => {
      const qrToken = params['token'];
      
      if (qrToken) {
        // Redirect from /qr/:token to /menu?table=:tableId
        this.loadMenuByQrToken(qrToken);
        return;
      }
    });

    // Load menu from table query parameter (primary route)
    this.route.queryParams.subscribe(queryParams => {
      const tableId = queryParams['table'];
      
      if (tableId) {
        this.tablePublicId = tableId;
        this.loadMenu();
      } else {
        this.error = 'Table non spécifiée. Veuillez scanner un QR code valide.';
        this.loading = false;
      }
    });
  }

  loadMenu(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.getPublicMenu(this.tablePublicId).subscribe(
      response => {
        this.tableNumber = response.tableNumber;
        this.isVip = response.isVip;
        this.customerSessionToken = response.customerSessionToken;
        this.categories = response.categories;
        this.popularItems = response.popularItems;
        this.flattenMenuItems();
        this.buildAllCategories();
        this.loading = false;
      },
      error => {
        this.error = 'Table non trouvée ou menu indisponible. Veuillez vérifier le QR code et réessayer.';
        this.loading = false;
      }
    );
  }

  loadMenuByQrToken(qrToken: string): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.getPublicMenuByQrToken(qrToken).subscribe(
      response => {
        // Redirect to /menu?table={tablePublicId} for simpler URL
        this.router.navigate(['/menu'], { 
          queryParams: { table: response.tablePublicId },
          replaceUrl: true 
        });
      },
      error => {
        this.error = 'QR code invalide ou table non trouvée. Veuillez scanner un code valide.';
        this.loading = false;
      }
    );
  }

  flattenMenuItems(): void {
    this.menuItems = [];
    this.categories.forEach(cat => {
      cat.items.forEach((item: MenuItem) => {
        this.menuItems.push({
          ...item,
          isSpecial: this.popularItems.some(p => p.publicId === item.publicId)
        });
      });
    });
    this.filterItems();
  }

  buildAllCategories(): void {
    this.allCategories = this.categories.map(cat => ({
      publicId: cat.publicId,
      name: cat.name
    }));
    
    if (this.allCategories.length > 0) {
      this.selectedCategory = this.allCategories[0].publicId;
      this.filterItems();
    }
  }

  selectCategory(categoryPublicId: string): void {
    this.selectedCategory = categoryPublicId;
    this.filterItems();
  }

  filterItems(): void {
    let filtered = [...this.menuItems];

    if (this.selectedCategory) {
      const category = this.categories.find(c => c.publicId === this.selectedCategory);
      if (category) {
        filtered = category.items;
      }
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    this.filteredItems = filtered;
  }

  addToCart(item: MenuItem): void {
    const existingItem = this.cart.find(c => c.menuItemPublicId === item.publicId);
    
    if (existingItem) {
      existingItem.quantity++;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
    } else {
      this.cart.push({
        menuItemPublicId: item.publicId,
        itemName: item.itemName,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price
      });
    }
    
    this.updateCartTotal();
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.updateCartTotal();
  }

  updateQuantity(cartItem: CartItem): void {
    if (cartItem.quantity < 1) {
      cartItem.quantity = 1;
    }
    cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
    this.updateCartTotal();
  }

  updateCartTotal(): void {
    this.cartTotal = this.cart.reduce((total, item) => total + item.totalPrice, 0);
  }

  submitOrder(): void {
    if (this.cart.length === 0) {
      this.error = 'Votre panier est vide';
      return;
    }

    this.submitting = true;
    this.error = '';

    const orderRequest = {
      customerSessionToken: this.customerSessionToken,
      items: this.cart.map(item => ({
        menuItemPublicId: item.menuItemPublicId,
        quantity: item.quantity
      })),
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      notes: this.notes
    };

    this.apiService.createPublicOrder(orderRequest).subscribe(
      response => {
        this.orderSuccess = true;
        this.orderNumber = response.orderNumber;
        this.submitting = false;
        this.cart = [];
        this.updateCartTotal();
        
        // Afficher confirmation pendant 5 secondes
        setTimeout(() => {
          this.orderSuccess = false;
          this.cart = [];
        }, 5000);
      },
      error => {
        this.error = error.error?.message || 'Erreur lors de la création de la commande';
        this.submitting = false;
      }
    );
  }

  openCart(): void {
    this.showCart = true;
  }

  closeCart(): void {
    this.showCart = false;
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateQuantity(item);
    }
  }

  increaseQuantity(item: CartItem): void {
    item.quantity++;
    this.updateQuantity(item);
  }

  formatPrice(price: number): string {
    const formatted = Math.round(price / 100).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  get isTableVip(): string {
    return this.isVip ? 'VIP' : 'Standard';
  }
}
