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
            <div class="w-full h-20 rounded bg-neutral-700 mb-1 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                *ngIf="menu.imageUrl" 
                [src]="menu.imageUrl" 
                alt="{{ menu.name }}"
                class="w-full h-full object-cover">
              <span *ngIf="!menu.imageUrl" class="text-neutral-400">📷</span>
            </div>
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
            <div class="text-xs text-neutral-500 mb-1 flex-shrink">{{ (menu.menuItems?.length || 0) }} art.</div>
            <div class="text-sm font-bold text-orange-400 mb-1.5 flex-shrink">
              <span *ngIf="menu.bundlePrice">{{ menu.bundlePrice }} FCFA</span>
              <span *ngIf="!menu.bundlePrice" class="text-gray-400">-</span>
            </div>
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
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Prix Normal</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-white">Prix Override</th>
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
                <td class="px-4 py-3 text-green-400 font-semibold">
                  <span *ngIf="item.products?.length > 0">{{ item.products[0].price }} FCFA</span>
                  <span *ngIf="!item.products?.length" class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-yellow-400 font-semibold">
                  <span *ngIf="item.priceOverride">{{ item.priceOverride }} FCFA</span>
                  <span *ngIf="!item.priceOverride" class="text-gray-400">-</span>
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
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">📷 Image</label>
              <div class="space-y-2">
                <div *ngIf="imagePreview()" class="relative w-24 h-24 rounded-lg border border-neutral-600 overflow-hidden bg-neutral-700">
                  <img [src]="imagePreview()" alt="Preview" class="w-full h-full object-cover">
                  <button type="button" (click)="clearImage()" class="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div *ngIf="!imagePreview()" class="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-700/50 flex items-center justify-center">
                  <p class="text-neutral-400 text-xs">📷</p>
                </div>
                <input #fileInput type="file" accept=".jpg,.jpeg,.png,.gif,.webp" (change)="onImageSelected($event)" class="hidden">
                <button type="button" (click)="fileInput.click()" class="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm font-medium transition-colors">
                  Choisir une image
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Type</label>
                <select formControlName="menuType" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
                  <option value="">-- Sélectionner --</option>
                  <option *ngFor="let type of menuTypes()" [value]="type">{{ type }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Prix Bundle (FCFA)</label>
                <input formControlName="bundlePrice" type="number" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white" placeholder="Optionnel">
              </div>
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
                  {{ product.name }} - {{ product.price }} FCFA
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Ordre d'affichage</label>
                <input formControlName="displayOrder" type="number" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white">
              </div>
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Prix Override (FCFA)</label>
                <input formControlName="priceOverride" type="number" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white" placeholder="Optionnel">
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Disponibilité</label>
              <div class="flex items-center gap-2 h-10 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded">
                <input type="checkbox" formControlName="available" class="w-4 h-4 rounded cursor-pointer">
                <span class="text-white text-sm">{{ itemForm.get('available')?.value ? 'Disponible' : 'Indisponible' }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Article Spécial?</label>
              <div class="flex items-center gap-2 h-10 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded">
                <input type="checkbox" formControlName="isSpecial" class="w-4 h-4 rounded cursor-pointer">
                <span class="text-white text-sm">{{ itemForm.get('isSpecial')?.value ? 'Oui' : 'Non' }}</span>
              </div>
            </div>

            <div *ngIf="itemForm.get('isSpecial')?.value">
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Description Spéciale</label>
              <textarea formControlName="specialDescription" class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white h-16 resize-none" placeholder="Ex: Offre limitée, en promotion..."></textarea>
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
  imageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
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
        console.log('Menus du backend:', data);
        data.forEach((menu: any) => {
          console.log(`Menu: ${menu.name}, imageUrl: ${menu.imageUrl}`);
        });
        this.menus.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement menus:', err);
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
      formData.append('bundlePrice', request.bundlePrice ? request.bundlePrice.toString() : '');
      formData.append('active', 'true');
      if (this.imageFile()) {
        formData.append('image', this.imageFile()!);
      }

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
