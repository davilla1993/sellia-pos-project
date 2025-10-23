import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <a routerLink="/admin/products/catalog" class="text-primary hover:text-primary-dark font-medium mb-4 inline-block">← Retour</a>
        <h1 class="text-3xl font-bold text-white">{{ isEditMode() ? "Éditer le produit" : "Nouveau produit" }}</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Form -->
      <form *ngIf="!isLoading()" [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700 p-6 space-y-4">
        
        <!-- Error -->
        <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {{ error() }}
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- LEFT COLUMN -->
          <div class="space-y-3">
            <!-- Image Upload -->
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
                <button type="button" (click)="fileInput.click()" class="w-full px-2 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium rounded transition">
                  Sélectionner
                </button>
                <p class="text-xs text-neutral-400">Max 5MB</p>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">Description</label>
              <textarea formControlName="description" class="w-full px-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition h-14 resize-none text-xs" placeholder="Description..."></textarea>
              <p class="text-xs text-neutral-400 mt-0.5">{{ form.get('description')?.value?.length || 0 }}/500</p>
            </div>

            <!-- Ingredients & Allergens -->
            <div>
              <h4 class="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">🥗 Composition</h4>
              <div class="space-y-2">
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1">Ingrédients</label>
                  <textarea formControlName="ingredients" class="w-full px-3 py-1.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition h-10 resize-none text-xs" placeholder="Ex: Tomate, Mozzarella"></textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1">⚠️ Allergènes</label>
                  <textarea formControlName="allergens" class="w-full px-3 py-1.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition h-10 resize-none text-xs" placeholder="Ex: Gluten, Lait"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="space-y-3">
            <!-- Name -->
            <div>
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Nom du produit *</label>
              <input formControlName="name" type="text" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="Pizza Margherita">
              <p *ngIf="hasError('name')" class="text-red-400 text-xs mt-1">Requis (max 100)</p>
            </div>

            <!-- Price & Category -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">Prix (FCFA) *</label>
                <input formControlName="price" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="1000">
                <p *ngIf="hasError('price')" class="text-red-400 text-xs mt-1">Requis (≥ 1)</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Catégorie *</label>
                <select formControlName="categoryId" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:border-primary/50 focus:outline-none transition">
                  <option value="">Sélectionner...</option>
                  <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                </select>
                <p *ngIf="hasError('categoryId')" class="text-red-400 text-xs mt-1">Requis</p>
              </div>
            </div>

            <!-- Stock -->
            <div>
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">📦 Stock (optionnel)</label>
              <input formControlName="stock" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="Laisser vide si pas de gestion">
              <p *ngIf="hasError('stock')" class="text-red-400 text-xs mt-1">Quantité invalide</p>
            </div>

            <!-- Settings Section -->
            <div>
              <h4 class="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">⚙️ Paramètres</h4>
              <div class="space-y-2">
                <!-- Station & Prep Time -->
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-semibold text-neutral-300 mb-1">Station *</label>
                    <select formControlName="workStation" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:border-primary/50 focus:outline-none transition text-sm">
                      <option *ngFor="let ws of workStations()" [value]="ws.value">{{ ws.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-300 mb-2">Prep (min)</label>
                    <input formControlName="preparationTime" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="10">
                  </div>
                </div>

                <!-- Order & VIP & Available -->
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-neutral-300 mb-2">Ordre</label>
                    <input formControlName="displayOrder" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:border-primary/50 focus:outline-none transition" placeholder="0">
                  </div>
                  <label class="flex items-end gap-2 cursor-pointer">
                    <input formControlName="isVip" type="checkbox" class="w-4 h-4 rounded border-neutral-600 accent-primary">
                    <span class="text-xs font-semibold text-neutral-300">👑 VIP</span>
                  </label>
                  <label class="flex items-end gap-2 cursor-pointer">
                    <input formControlName="available" type="checkbox" class="w-4 h-4 rounded border-neutral-600 accent-primary">
                    <span class="text-xs font-semibold text-neutral-300">✓ Disponible</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2 pt-3 border-t border-neutral-700">
          <button type="submit" [disabled]="isSubmitting() || form.invalid" class="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded transition text-sm">
            {{ isSubmitting() ? "⏳..." : isEditMode() ? "✓ Mettre à jour" : "✓ Créer" }}
          </button>
          <a routerLink="/admin/products/catalog" class="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded transition text-center text-sm">
            Annuler
          </a>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  imagePreview = signal<string | null>(null);
  categories = signal<any[]>([]);
  workStations = signal<any[]>([]);
  selectedImage: File | null = null;
  productId: string | null = null;
  
  // Constantes de validation
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(1), Validators.max(999999999)]],
      categoryId: ['', Validators.required],
      workStation: ['KITCHEN', Validators.required],
      preparationTime: ['', [Validators.min(0), Validators.max(999)]],
      isVip: [false],
      available: [true],
      displayOrder: [0, [Validators.min(0), Validators.max(9999)]],
      allergens: [''],
      ingredients: [''],
      stock: ['', [Validators.min(0), Validators.max(999999)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadWorkStations();
    
    this.productId = this.route.snapshot.paramMap.get('id');
    
    if (this.productId) {
      this.isEditMode.set(true);
      this.loadProduct();
    }
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (data: any) => {
        this.categories.set(Array.isArray(data) ? data : data.content || []);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des catégories');
      }
    });
  }

  loadWorkStations(): void {
    this.apiService.getWorkStations().subscribe({
      next: (data: any) => {
        this.workStations.set(Array.isArray(data) ? data : data.content || []);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des stations de travail');
      }
    });
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.isLoading.set(true);
    this.apiService.getProductByIdAdmin(this.productId).subscribe({
      next: (product) => {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          workStation: product.workStation || 'KITCHEN',
          preparationTime: product.preparationTime || '',
          isVip: product.isVip || false,
          available: product.available !== false,
          displayOrder: product.displayOrder || 0,
          allergens: product.allergens || '',
          ingredients: product.ingredients || '',
          stock: product.stock || ''
        });
        if (product.imageUrl) {
          this.imagePreview.set(product.imageUrl);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement du produit');
        this.isLoading.set(false);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];
      
      // Vérifier le type MIME
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        this.error.set(`❌ Format non supporté. Veuillez sélectionner une image en format JPEG, PNG, GIF ou WebP.`);
        return;
      }
      
      // Vérifier la taille du fichier
      if (file.size > this.MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.error.set(`❌ L'image est trop volumineuse (${sizeMB}MB). Maximum autorisé: 5MB.`);
        return;
      }

      this.selectedImage = file;
      this.error.set(null); // Effacer les erreurs précédentes
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.imagePreview.set(null);
    this.selectedImage = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const formData = new FormData();
    
    formData.append('name', formValue.name);
    formData.append('description', formValue.description || '');
    formData.append('price', formValue.price.toString());
    formData.append('categoryId', formValue.categoryId);
    formData.append('workStation', formValue.workStation);
    formData.append('preparationTime', formValue.preparationTime || '0');
    formData.append('isVip', (formValue.isVip || false).toString());
    formData.append('available', (formValue.available !== false).toString());
    formData.append('displayOrder', formValue.displayOrder || '0');
    formData.append('allergens', formValue.allergens || '');
    formData.append('ingredients', formValue.ingredients || '');
    
    if (formValue.stock !== null && formValue.stock !== '' && formValue.stock !== undefined) {
      formData.append('stockQuantity', formValue.stock.toString());
    }
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.isEditMode() && this.productId) {
      this.apiService.updateProduct(this.productId, formData).subscribe({
        next: () => this.router.navigate(['/admin/products/catalog']),
        error: (err) => {
          this.error.set(this.getDetailedErrorMessage(err, 'Erreur lors de la mise à jour'));
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.apiService.createProduct(formData).subscribe({
        next: () => this.router.navigate(['/admin/products/catalog']),
        error: (err) => {
          this.error.set(this.getDetailedErrorMessage(err, 'Erreur lors de la création'));
          this.isSubmitting.set(false);
        }
      });
    }
  }

  private getDetailedErrorMessage(err: any, defaultMessage: string): string {
    // Vérifier si c'est une erreur de validation avec détails
    if (err.error?.validationErrors && typeof err.error.validationErrors === 'object') {
      const errors = err.error.validationErrors;
      const errorMessages = Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join('\n');
      return `Erreurs de validation:\n${errorMessages}`;
    }
    
    // Vérifier si c'est une erreur métier
    if (err.error?.message) {
      return err.error.message;
    }
    
    // Vérifier le statut HTTP
    if (err.status === 400) {
      return 'Veuillez vérifier que tous les champs obligatoires sont correctement remplis.';
    }
    if (err.status === 409) {
      return 'Ce produit existe déjà. Veuillez utiliser un nom différent.';
    }
    if (err.status === 403) {
      return 'Vous n\'avez pas les permissions pour effectuer cette action.';
    }
    if (err.status === 413) {
      return 'L\'image est trop volumineuse. Veuillez sélectionner une image plus petite.';
    }
    if (err.status >= 500) {
      return 'Erreur serveur. Veuillez réessayer ultérieurement.';
    }
    
    return defaultMessage;
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
