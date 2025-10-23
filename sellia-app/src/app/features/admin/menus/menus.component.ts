import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Gestion des Menus</h1>
          <p class="text-neutral-400">Créez et gérez vos menus</p>
        </div>
        <div class="flex gap-2">
          <button 
            (click)="generateIndividualProducts()" 
            [disabled]="isGenerating()"
            title="Génère automatiquement un MenuItem pour chaque produit"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            ✨ {{ isGenerating() ? 'Génération...' : 'Produits Individuels' }}
          </button>
          <button (click)="openCreateMenuModal()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
            + Nouveau Menu
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-neutral-700">
        <button 
          (click)="activeTab.set('menus')"
          [class.border-b-2]="activeTab() === 'menus'"
          [class.border-orange-500]="activeTab() === 'menus'"
          [class.text-white]="activeTab() === 'menus'"
          [class.text-neutral-400]="activeTab() !== 'menus'"
          class="pb-2 font-semibold transition-colors">
          Menus ({{ menus().length }})
        </button>
        <button 
          (click)="activeTab.set('items')"
          [class.border-b-2]="activeTab() === 'items'"
          [class.border-orange-500]="activeTab() === 'items'"
          [class.text-white]="activeTab() === 'items'"
          [class.text-neutral-400]="activeTab() !== 'items'"
          class="pb-2 font-semibold transition-colors">
          Articles ({{ menuItems().length }})
        </button>
      </div>

      <!-- Menus Tab -->
      <div *ngIf="activeTab() === 'menus'" class="space-y-4">
        <div *ngIf="isLoading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>

        <div *ngIf="!isLoading() && menus().length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          <div *ngFor="let menu of menus()" class="bg-neutral-800 rounded border border-neutral-700 p-2 hover:border-neutral-600 transition flex flex-col">
            <div class="flex justify-between items-start gap-1 mb-1 min-h-0">
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-white truncate">{{ menu.name }}</h3>
                <p class="text-xs text-neutral-500 truncate">{{ menu.menuType }}</p>
              </div>
              <span [class]="menu.active ? 'text-green-300' : 'text-red-300'" class="text-lg flex-shrink-0" title="{{ menu.active ? 'Actif' : 'Inactif' }}">
                {{ menu.active ? '●' : '○' }}
              </span>
            </div>
            <p class="text-xs text-neutral-400 mb-1 line-clamp-1 flex-shrink">{{ menu.description }}</p>
            <div class="text-xs text-neutral-500 mb-1.5 flex-shrink">{{ menu.itemCount || 0 }} art.</div>
            <div class="flex gap-0.5 mt-auto">
              <button 
                (click)="editMenu(menu)"
                title="Éditer"
                class="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                ✏️
              </button>
              <button 
                (click)="toggleMenuStatus(menu)"
                title="{{ menu.active ? 'Désactiver' : 'Activer' }}"
                [class]="menu.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
                class="p-1.5 text-white rounded text-sm transition-colors">
                {{ menu.active ? '🔒' : '🔓' }}
              </button>
              <button 
                (click)="deleteMenu(menu)"
                title="Supprimer"
                class="p-1.5 bg-red-900 hover:bg-red-800 text-white rounded text-sm transition-colors">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading() && menus().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
          <p class="text-neutral-400">Aucun menu créé</p>
        </div>
      </div>

      <!-- Items Tab -->
      <div *ngIf="activeTab() === 'items'" class="space-y-4">
        <div class="flex gap-2 mb-4">
          <select [(ngModel)]="selectedMenuForItems" (change)="loadMenuItems()" class="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
            <option value="">-- Sélectionner un menu --</option>
            <option *ngFor="let menu of menus()" [value]="menu.publicId">{{ menu.name }}</option>
          </select>
          <button 
            (click)="openCreateItemModal()" 
            [disabled]="!selectedMenuForItems"
            class="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
            + Ajouter Article
          </button>
        </div>

        <div *ngIf="isLoading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>

        <div *ngIf="!isLoading() && menuItems().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-neutral-700 border-b border-neutral-600">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Produit(s)</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Prix Calculé</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Bundle</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Ordre</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Dispo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of menuItems()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
                <td class="px-4 py-3 text-white">
                  <div *ngIf="item.products && item.products.length > 0">
                    <span class="font-semibold">{{ item.products[0].name }}</span>
                    <span *ngIf="item.products.length > 1" class="text-xs text-neutral-400 ml-2">+{{ item.products.length - 1 }} autre(s)</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-orange-400 font-semibold">
                  {{ item.calculatedPrice ? (item.calculatedPrice / 100).toFixed(0) : '-' }} FCFA
                </td>
                <td class="px-4 py-3 text-neutral-400">
                  {{ item.bundlePrice ? (item.bundlePrice / 100).toFixed(0) : '-' }} FCFA
                </td>
                <td class="px-4 py-3 text-neutral-400">{{ item.displayOrder }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.available ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'" class="px-2 py-1 rounded text-xs font-semibold">
                    {{ item.available ? '✓ Oui' : '✕ Non' }}
                  </span>
                </td>
                <td class="px-4 py-3 space-x-2 flex">
                  <button (click)="editMenuItem(item)" class="text-blue-400 hover:text-blue-300 text-sm font-medium">✏️</button>
                  <button (click)="deleteMenuItem(item.publicId)" class="text-red-400 hover:text-red-300 text-sm font-medium">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!isLoading() && menuItems().length === 0 && selectedMenuForItems" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
          <p class="text-neutral-400">Aucun article dans ce menu</p>
        </div>
      </div>

      <!-- Menu Modal -->
      <div *ngIf="showMenuModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-neutral-700 max-h-screen overflow-y-auto">
          <h2 class="text-2xl font-bold text-white mb-4">{{ editingMenu ? 'Éditer Menu' : 'Nouveau Menu' }}</h2>
          
          <form [formGroup]="menuForm" (ngSubmit)="saveMenu()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Nom</label>
              <input formControlName="name" type="text" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white" placeholder="Menu du Jour">
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Description</label>
              <textarea formControlName="description" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white" placeholder="Description..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Type</label>
              <select formControlName="menuType" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
                <option value="">-- Sélectionner --</option>
                <option *ngFor="let type of menuTypes()" [value]="type">{{ type }}</option>
              </select>
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="closeMenuModal()" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button type="submit" [disabled]="!menuForm.valid || isSaving()" class="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MenuItem Modal -->
      <div *ngIf="showItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-neutral-700 max-h-screen overflow-y-auto">
          <h2 class="text-2xl font-bold text-white mb-4">{{ editingMenuItem ? 'Éditer Article' : 'Ajouter Article' }}</h2>
          
          <form [formGroup]="itemForm" (ngSubmit)="saveMenuItem()" class="space-y-4">
            <!-- Search Bar -->
            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Rechercher un produit</label>
              <div class="flex items-center gap-2 bg-neutral-700/50 rounded-lg px-3 py-2 border border-neutral-600 mb-2">
                <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  [(ngModel)]="searchTerm" 
                  (input)="filterProducts()"
                  type="text" 
                  placeholder="Rechercher par nom..." 
                  class="flex-1 bg-transparent text-white placeholder-neutral-500 focus:outline-none text-sm"
                  [ngModelOptions]="{ standalone: true }">
              </div>
              <p class="text-xs text-neutral-400">{{ filteredProducts().length }} / {{ availableProducts().length }} produits</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Produit *</label>
              <select formControlName="productId" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white max-h-40">
                <option value="">-- Sélectionner un produit --</option>
                <option *ngFor="let product of filteredProducts()" [value]="product.publicId">
                  {{ product.name }} - FCFA {{ (product.price / 100).toFixed(0) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Ordre d'affichage</label>
              <input formControlName="displayOrder" type="number" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="closeItemModal()" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button type="submit" [disabled]="!itemForm.valid || isSaving()" class="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Error Toast -->
      <div *ngIf="error()" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg">
        {{ error() }}
      </div>
    </div>
  `,
  styles: []
})
export class MenusComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  menus = signal<any[]>([]);
  menuItems = signal<any[]>([]);
  menuTypes = signal<string[]>([]);
  availableProducts = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal(false);
  isSaving = signal(false);
  isGenerating = signal(false);
  error = signal<string | null>(null);
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
      menuType: ['', Validators.required]
    });

    this.itemForm = this.fb.group({
      productId: ['', Validators.required],
      displayOrder: [0, Validators.required]
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
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des menus');
        this.isLoading.set(false);
      }
    });
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

  openCreateMenuModal(): void {
    this.editingMenu = null;
    this.menuForm.reset();
    this.showMenuModal = true;
  }

  editMenu(menu: any): void {
    this.editingMenu = menu;
    this.menuForm.patchValue({
      name: menu.name,
      description: menu.description,
      menuType: menu.menuType
    });
    this.showMenuModal = true;
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
  }

  saveMenu(): void {
    if (!this.menuForm.valid) return;
    
    this.isSaving.set(true);
    const request = this.menuForm.value;

    if (this.editingMenu) {
      this.apiService.updateMenu(this.editingMenu.publicId, request).subscribe({
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
      const formData = new FormData();
      formData.append('name', request.name);
      formData.append('description', request.description || '');
      formData.append('menuType', request.menuType);
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

  generateIndividualProducts(): void {
    if (!confirm('Cela va générer automatiquement un MenuItem pour chaque produit disponible.\n\nContinuer ?')) return;
    
    this.isGenerating.set(true);
    this.apiService.generateIndividualProductMenuItems().subscribe({
      next: (response) => {
        this.isGenerating.set(false);
        this.toast.success(`✨ ${response.itemsCreated} MenuItems créés`);
        this.loadMenus();
      },
      error: (err) => {
        this.isGenerating.set(false);
        const errorMsg = err.error?.message || 'Erreur lors de la génération';
        this.error.set(errorMsg);
        this.toast.error(errorMsg);
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
    this.itemForm.patchValue({
      productId: item.productPublicId || item.productId,
      displayOrder: item.displayOrder
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
    const productId = this.itemForm.value.productId;
    const displayOrder = this.itemForm.value.displayOrder;

    if (this.editingMenuItem) {
      const updateRequest = {
        productPublicId: productId,
        displayOrder: displayOrder
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
        displayOrder: displayOrder
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
