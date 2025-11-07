import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface ComboProductDetail {
  name: string;
  imageUrl: string;
  price: number;
}

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
  categoryName?: string;
  categoryId?: number;
  productCount?: number;
  comboProducts?: ComboProductDetail[];
}

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
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
  searchQuery: string = '';
  categories: CategoryFilter[] = [];
  selectedCategory: string = 'all';
  
  cart: CartItem[] = [];
  cartTotal: number = 0;
  customerName: string = '';
  customerPhone: string = '';
  notes: string = '';
  
  showCart: boolean = false;
  submitting: boolean = false;
  orderSuccess: boolean = false;
  orderNumber: string = '';

  showComboModal: boolean = false;
  selectedCombo: MenuItem | null = null;
  
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
        this.extractCategories();
        this.filterItems();
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

    // Extraire les items depuis les catégories (qui contiennent les items détaillés)
    response.categories.forEach((menu: any) => {
      if (menu.items && Array.isArray(menu.items)) {
        menu.items.forEach((item: any) => {
          // Mapper les produits du combo avec leurs images
          const comboProducts = item.comboProducts ? item.comboProducts.map((product: any) => ({
            name: product.name,
            imageUrl: this.buildImageUrl(product.imageUrl),
            price: product.price
          })) : undefined;

          items.push({
            publicId: item.publicId,
            menuName: item.menuName || '',
            itemName: item.itemName,
            price: item.price || 0,
            description: item.description || '',
            preparationTime: item.preparationTime || 0,
            isSpecial: item.isSpecial || false,
            specialDescription: item.specialDescription || '',
            imagePath: this.buildImageUrl(item.imageUrl),
            categoryName: item.categoryName,
            categoryId: item.categoryId,
            productCount: item.productCount || 0,
            comboProducts: comboProducts
          });
        });
      }
    });

    return items;
  }

  /**
   * Extrait les catégories uniques des items et compte le nombre d'items par catégorie
   * Crée une catégorie virtuelle "Combos" pour les menus avec plusieurs produits
   */
  private extractCategories(): void {
    const categoryMap = new Map<string, { name: string; count: number }>();

    // Ajouter la catégorie "Tous"
    categoryMap.set('all', { name: 'Tous', count: this.allMenuItems.length });

    this.allMenuItems.forEach(item => {
      // Si le menu contient plusieurs produits, c'est un combo
      if (item.productCount && item.productCount > 1) {
        const existing = categoryMap.get('combos');
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set('combos', { name: 'Combos', count: 1 });
        }
      }
      // Sinon, utiliser la catégorie du produit
      else if (item.categoryName && item.categoryId) {
        const key = `cat_${item.categoryId}`;
        const existing = categoryMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(key, { name: item.categoryName, count: 1 });
        }
      }
    });

    // Convertir en tableau et trier
    this.categories = Array.from(categoryMap.entries())
      .map(([id, data]) => ({ id, name: data.name, count: data.count }))
      .sort((a, b) => {
        // "Tous" en premier
        if (a.id === 'all') return -1;
        if (b.id === 'all') return 1;
        // "Combos" en dernier
        if (a.id === 'combos') return 1;
        if (b.id === 'combos') return -1;
        // Les autres par ordre alphabétique
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Construit l'URL complète de l'image à partir de l'URL relative
   * Utilise l'environnement pour construire l'URL correcte en dev et prod
   */
  private buildImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';

    // Si l'URL est déjà complète (commence par http), la retourner telle quelle
    if (imageUrl.startsWith('http')) return imageUrl;

    // Extraire le nom du fichier depuis le chemin
    const filename = imageUrl.includes('/') ? imageUrl.split('/').pop() : imageUrl;

    // Construire l'URL en utilisant l'apiUrl de l'environnement
    const baseUrl = environment.apiUrl.startsWith('http')
      ? environment.apiUrl
      : `${window.location.origin}${environment.apiUrl}`;

    return `${baseUrl}/products/images/${filename}`;
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

  filterItems(): void {
    let items = [...this.allMenuItems];

    // Filtrer par catégorie
    if (this.selectedCategory !== 'all') {
      if (this.selectedCategory === 'combos') {
        // Filtrer les combos (menus avec plusieurs produits)
        items = items.filter(item => item.productCount && item.productCount > 1);
      } else {
        // Filtrer par catégorie de produit
        const categoryId = parseInt(this.selectedCategory.replace('cat_', ''));
        items = items.filter(item => item.categoryId === categoryId);
      }
    }

    // Filtrer par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    this.filteredItems = items;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterItems();
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
    const formatted = Math.round(price).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  get isTableVip(): string {
    return this.isVip ? 'VIP' : 'Standard';
  }

  openComboModal(item: MenuItem): void {
    this.selectedCombo = item;
    this.showComboModal = true;
  }

  closeComboModal(): void {
    this.showComboModal = false;
    this.selectedCombo = null;
  }
}
