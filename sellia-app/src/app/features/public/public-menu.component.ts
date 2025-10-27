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
  
  allMenuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  paginatedItems: MenuItem[] = [];
  
  searchQuery: string = '';
  currentPage: number = 0;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  
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
        
        this.allMenuItems = this.flattenMenuItems(response);
        this.filterAndPaginate();
        this.loading = false;
      },
      error => {
        this.error = 'Table non trouvée ou menu indisponible. Veuillez vérifier le QR code et réessayer.';
        this.loading = false;
      }
    );
  }

  private flattenMenuItems(response: any): MenuItem[] {
    const items: MenuItem[] = [];
    
    if (!response.categories || !Array.isArray(response.categories)) {
      return items;
    }

    // Les catégories n'ont pas d'items, afficher les catégories comme items
    response.categories.forEach((category: any) => {
      items.push({
        publicId: category.publicId,
        menuName: category.name || '',
        itemName: category.name,
        price: 0,
        description: category.description || `${category.itemCount} article(s)`,
        preparationTime: 0,
        isSpecial: false,
        specialDescription: `${category.itemCount} article(s) disponible(s)`,
        imagePath: ''
      });
    });

    return items;
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

  filterAndPaginate(): void {
    let filtered = [...this.allMenuItems];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    this.filteredItems = filtered;
    this.currentPage = 0;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedItems = this.filteredItems.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
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
