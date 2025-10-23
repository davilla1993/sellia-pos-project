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
      <form *ngIf="!isLoading()" [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700 p-8 max-w-3xl space-y-8">
        
        <!-- Error -->
        <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {{ error() }}
        </div>

        <!-- Section: Image & Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Image Upload -->
          <div class="md:col-span-1">
            <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">📷 Image</label>
            <div class="space-y-3">
              <!-- Preview -->
              <div *ngIf="imagePreview()" class="relative w-full aspect-square rounded-lg border border-neutral-600 overflow-hidden bg-neutral-700">
                <img [src]="imagePreview()" alt="Preview" class="w-full h-full object-cover">
                <button type="button" (click)="clearImage()" class="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-lg transition">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div *ngIf="!imagePreview()" class="w-full aspect-square rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-700/50 flex items-center justify-center">
                <p class="text-neutral-400 text-sm">Pas d'image</p>
              </div>
              
              <input #fileInput type="file" accept=".jpg,.jpeg,.png,.gif,.webp" (change)="onImageSelected($event)" class="hidden">
              <button type="button" (click)="fileInput.click()" class="w-full px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-lg transition">
                Sélectionner
              </button>
              <p class="text-xs text-neutral-400">Max 5MB • JPG, PNG, GIF, WebP</p>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="md:col-span-2 space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Nom *</label>
              <input formControlName="name" type="text" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="Pizza Margherita">
              <p *ngIf="hasError('name')" class="text-red-400 text-xs mt-1">Requis (max 100 caractères)</p>
            </div>

            <!-- Price & Category Row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Prix (FCFA) *</label>
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
          </div>
        </div>

        <!-- Section: Description -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Description</label>
          <textarea formControlName="description" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition h-20 resize-none" placeholder="Description du produit..."></textarea>
          <p class="text-xs text-neutral-400 mt-1">{{ form.get('description')?.value?.length || 0 }}/500</p>
        </div>

        <!-- Section: Settings -->
        <div class="space-y-5">
          <h3 class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">⚙️ Paramètres</h3>
          
          <!-- Grid: Station & Preparation Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-neutral-300 mb-2">Station de Travail *</label>
              <select formControlName="workStation" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:border-primary/50 focus:outline-none transition">
                <option *ngFor="let ws of workStations()" [value]="ws.value">{{ ws.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-neutral-300 mb-2">Temps de prep. (min)</label>
              <input formControlName="preparationTime" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="10">
            </div>
          </div>

          <!-- Grid: Display Order & VIP -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-neutral-300 mb-2">Ordre d'affichage</label>
              <input formControlName="displayOrder" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:border-primary/50 focus:outline-none transition" placeholder="0">
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 cursor-pointer">
                <input formControlName="isVip" type="checkbox" class="w-4 h-4 rounded border-neutral-600 accent-primary">
                <span class="text-sm font-medium text-neutral-300">👑 Produit VIP</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Section: Ingredients & Allergens -->
        <div class="space-y-5">
          <h3 class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">🥗 Composition</h3>
          
          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-2">Ingrédients (séparés par virgule)</label>
            <textarea formControlName="ingredients" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition h-16 resize-none text-sm" placeholder="Ex: Tomate, Mozzarella, Basilic"></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-2">⚠️ Allergènes (séparés par virgule)</label>
            <textarea formControlName="allergens" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition h-16 resize-none text-sm" placeholder="Ex: Gluten, Lait, Œufs"></textarea>
          </div>
        </div>

        <!-- Section: Stock -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">📦 Stock (optionnel)</label>
          <input formControlName="stock" type="number" class="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:border-primary/50 focus:outline-none transition" placeholder="Laisser vide si pas de gestion de stock">
          <p *ngIf="hasError('stock')" class="text-red-400 text-xs mt-1">La quantité doit être valide</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4 border-t border-neutral-700">
          <button type="submit" [disabled]="isSubmitting() || form.invalid" class="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition">
            {{ isSubmitting() ? "⏳ En cours..." : isEditMode() ? "✓ Mettre à jour" : "✓ Créer" }}
          </button>
          <a routerLink="/admin/products/catalog" class="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg transition text-center">
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
