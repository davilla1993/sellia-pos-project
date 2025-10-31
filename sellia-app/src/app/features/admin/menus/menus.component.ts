import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  menus = signal<any[]>([]);
  filteredMenus = signal<any[]>([]);
  selectedMenuType = signal<string>('all');
  menuItems = signal<any[]>([]);
  menuTypes = signal<string[]>([]);
  availableProducts = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  imageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  imageUrls = signal<{ [key: string]: string }>({});
  activeTab = signal<'menus' | 'items'>('menus');
  
  showMenuModal = false;
  showItemModal = false;
  editingMenu: any = null;
  editingMenuItem: any = null;
  selectedMenuForItems = '';

  menuForm: FormGroup;
  itemForm: FormGroup;

  constructor() {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      menuType: ['', Validators.required],
      bundlePrice: ['', Validators.required]
    });

    this.itemForm = this.fb.group({
      productId: ['', Validators.required],
      displayOrder: [0, Validators.required],
      priceOverride: [''],
      available: [true],
      isSpecial: [false],
      specialDescription: ['']
    });
  }

  ngOnInit(): void {
    this.loadMenuTypes();
    this.loadMenus();
    this.loadProducts();
  }

  loadMenuTypes(): void {
    this.apiService.getMenuTypes().subscribe({
      next: (types) => {
        this.menuTypes.set(types);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des types de menu');
      }
    });
  }

  loadMenus(): void {
    this.isLoading.set(true);
    this.apiService.getAllMenus(0, 100).subscribe({
      next: (data) => {
        this.menus.set(data);
        this.filterMenus();
        this.loadMenuImages(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des menus');
        this.isLoading.set(false);
      }
    });
  }

  filterMenus(): void {
    const selectedType = this.selectedMenuType();
    if (selectedType === 'all') {
      this.filteredMenus.set(this.menus());
    } else {
      const filtered = this.menus().filter(menu => menu.menuType === selectedType);
      this.filteredMenus.set(filtered);
    }
  }

  selectMenuType(type: string): void {
    this.selectedMenuType.set(type);
    this.filterMenus();
  }

  getStandardCount(): number {
    return this.menus().filter(m => m.menuType === 'STANDARD').length;
  }

  getVipCount(): number {
    return this.menus().filter(m => m.menuType === 'VIP').length;
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

  getImageUrl(menu: any): string {
    return this.imageUrls()[menu.publicId] || '';
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.availableProducts.set(products);
        this.filteredProducts.set(products);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  filterProducts(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.availableProducts());
    } else {
      const filtered = this.availableProducts().filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
      this.filteredProducts.set(filtered);
    }
  }

  loadMenuItems(): void {
    if (!this.selectedMenuForItems) {
      this.menuItems.set([]);
      return;
    }
    
    this.isLoading.set(true);
    this.apiService.getMenuItemsOrdered(this.selectedMenuForItems).subscribe({
      next: (data) => {
        this.menuItems.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des articles');
        this.isLoading.set(false);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.imageFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.imageFile.set(null);
    this.imagePreview.set(null);
  }

  openCreateMenuModal(): void {
    this.editingMenu = null;
    this.menuForm.reset();
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.showMenuModal = true;
  }

  editMenu(menu: any): void {
    this.editingMenu = menu;
    this.menuForm.patchValue({
      name: menu.name,
      description: menu.description,
      menuType: menu.menuType,
      bundlePrice: menu.bundlePrice || ''
    });
    this.showMenuModal = true;
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
    this.imageFile.set(null);
    this.imagePreview.set(null);
  }

  saveMenu(): void {
    if (!this.menuForm.valid) return;
    
    this.isSaving.set(true);
    const request = this.menuForm.value;
    const formData = new FormData();
    formData.append('name', request.name);
    formData.append('description', request.description || '');
    formData.append('menuType', request.menuType);
    formData.append('bundlePrice', request.bundlePrice ? request.bundlePrice.toString() : '');
    if (this.imageFile()) {
      formData.append('image', this.imageFile()!);
    }

    if (this.editingMenu) {
      formData.append('active', this.editingMenu.active.toString());
      this.apiService.updateMenu(this.editingMenu.publicId, formData).subscribe({
        next: () => {
          this.toast.success('Menu mis à jour');
          this.closeMenuModal();
          this.loadMenus();
          this.isSaving.set(false);
        },
        error: () => {
          this.error.set('Erreur lors de la mise à jour');
          this.isSaving.set(false);
        }
      });
    } else {
      formData.append('active', 'true');
      this.apiService.createMenu(formData).subscribe({
        next: () => {
          this.toast.success('Menu créé');
          this.closeMenuModal();
          this.loadMenus();
          this.isSaving.set(false);
        },
        error: () => {
          this.error.set('Erreur lors de la création');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleMenuStatus(menu: any): void {
    if (menu.active) {
      this.apiService.deactivateMenu(menu.publicId).subscribe({
        next: () => {
          this.toast.success('Menu désactivé');
          this.loadMenus();
        },
        error: () => this.error.set('Erreur')
      });
    } else {
      this.apiService.activateMenu(menu.publicId).subscribe({
        next: () => {
          this.toast.success('Menu activé');
          this.loadMenus();
        },
        error: () => this.error.set('Erreur')
      });
    }
  }

  deleteMenu(menu: any): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le menu "${menu.name}" ?`)) return;
    
    this.apiService.deleteMenu(menu.publicId).subscribe({
      next: () => {
        this.toast.success('Menu supprimé');
        this.loadMenus();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erreur lors de la suppression';
        this.error.set(errorMsg);
      }
    });
  }

  openCreateItemModal(): void {
    if (!this.selectedMenuForItems) return;
    this.editingMenuItem = null;
    this.itemForm.reset({ displayOrder: 0 });
    this.showItemModal = true;
  }

  editMenuItem(item: any): void {
    this.editingMenuItem = item;
    const product = item.products && item.products.length > 0 ? item.products[0] : null;
    this.itemForm.patchValue({
      productId: product?.publicId || '',
      displayOrder: item.displayOrder || 0,
      priceOverride: item.priceOverride || '',
      available: item.available !== false,
      isSpecial: item.isSpecial || false,
      specialDescription: item.specialDescription || ''
    });
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.editingMenuItem = null;
    this.itemForm.reset({ displayOrder: 0 });
    this.searchTerm.set('');
    this.filteredProducts.set(this.availableProducts());
  }

  saveMenuItem(): void {
    if (!this.itemForm.valid) return;

    this.isSaving.set(true);
    const formValue = this.itemForm.value;
    const productId = formValue.productId;

    if (this.editingMenuItem) {
      const updateRequest = {
        productPublicId: productId,
        displayOrder: formValue.displayOrder || 0,
        priceOverride: formValue.priceOverride ? parseInt(formValue.priceOverride) : null,
        available: formValue.available !== false,
        isSpecial: formValue.isSpecial || false,
        specialDescription: formValue.specialDescription || ''
      };
      this.apiService.updateMenuItem(this.editingMenuItem.publicId, updateRequest).subscribe({
        next: () => {
          this.toast.success('Article mis à jour');
          this.closeItemModal();
          this.loadMenuItems();
          this.isSaving.set(false);
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Erreur lors de la mise à jour';
          this.error.set(errorMsg);
          this.isSaving.set(false);
        }
      });
    } else {
      const createRequest = {
        menuId: this.selectedMenuForItems,
        productIds: [productId],
        displayOrder: formValue.displayOrder || 0,
        priceOverride: formValue.priceOverride ? parseInt(formValue.priceOverride) : null,
        available: formValue.available !== false,
        isSpecial: formValue.isSpecial || false,
        specialDescription: formValue.specialDescription || ''
      };
      this.apiService.createMenuItem(createRequest).subscribe({
        next: () => {
          this.toast.success('Article ajouté au menu');
          this.closeItemModal();
          this.loadMenuItems();
          this.isSaving.set(false);
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Erreur lors de l\'ajout';
          this.error.set(errorMsg);
          this.isSaving.set(false);
        }
      });
    }
  }

  deleteMenuItem(publicId: string): void {
    if (!confirm('Êtes-vous sûr?')) return;
    
    this.apiService.deleteMenuItem(publicId).subscribe({
      next: () => {
        this.toast.success('Article supprimé');
        this.loadMenuItems();
      },
      error: () => this.error.set('Erreur')
    });
  }
}
