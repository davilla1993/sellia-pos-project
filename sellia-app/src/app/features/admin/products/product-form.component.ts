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
      <form *ngIf="!isLoading()" [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-neutral-800 rounded-lg border border-neutral-700 p-6 max-w-2xl space-y-6">
        
        <!-- Error -->
        <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
          {{ error() }}
        </div>

        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Image du Produit</label>
          <p class="text-xs text-neutral-400 mb-3">JPEG, PNG, GIF ou WebP • Max 5MB</p>
          <div class="space-y-3">
            <!-- Preview -->
            <div *ngIf="imagePreview()" class="relative w-48 h-48 rounded-lg border border-neutral-600 overflow-hidden bg-neutral-700">
              <img [src]="imagePreview()" alt="Preview" class="w-full h-full object-cover">
              <button type="button" (click)="clearImage()" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Upload Input -->
            <input #fileInput type="file" accept=".jpg,.jpeg,.png,.gif,.webp" (change)="onImageSelected($event)" class="hidden">
            <button type="button" (click)="fileInput.click()" class="btn-secondary">
              📷 Sélectionner une image
            </button>
          </div>
        </div>

        <!-- Name -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Nom du Produit *</label>
          <input formControlName="name" type="text" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="Pizza Margherita">
          <p *ngIf="hasError('name')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Description</label>
          <textarea formControlName="description" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500 h-24" placeholder="Description du produit..."></textarea>
          <p *ngIf="form.get('description')?.value?.length" class="text-xs text-neutral-400 mt-1">{{ form.get('description')?.value?.length }}/500</p>
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Prix (FCFA) *</label>
          <input formControlName="price" type="number" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="1000">
          <p *ngIf="hasError('price')" class="text-red-400 text-sm mt-1">Requis, doit être ≥ 1</p>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Catégorie *</label>
          <select formControlName="categoryId" class="input-field bg-neutral-700 border-neutral-600 text-white">
            <option value="">Sélectionner une catégorie</option>
            <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
          </select>
          <p *ngIf="hasError('categoryId')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Stock -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Quantité en Stock <span class="text-neutral-400 text-xs">(optionnel)</span></label>
          <input formControlName="stock" type="number" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="Laisser vide si pas de gestion de stock">
          <p *ngIf="hasError('stock')" class="text-red-400 text-sm mt-1">La quantité doit être valide</p>
        </div>

        <!-- Work Station -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Station de Travail *</label>
          <select formControlName="workStation" class="input-field bg-neutral-700 border-neutral-600 text-white">
            <option *ngFor="let ws of workStations()" [value]="ws.value">{{ ws.label }}</option>
          </select>
          <p *ngIf="hasError('workStation')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4">
          <button type="submit" [disabled]="isSubmitting() || form.invalid" class="btn-primary" [class.opacity-50]="isSubmitting() || form.invalid">
            {{ isSubmitting() ? "En cours..." : isEditMode() ? "Mettre à jour" : "Créer" }}
          </button>
          <a routerLink="/admin/products/catalog" class="btn-outline">Annuler</a>
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
      stock: ['', [Validators.min(0), Validators.max(999999)]],
      workStation: ['KITCHEN', Validators.required]
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
          stock: product.stock,
          workStation: product.workStation || 'KITCHEN'
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
    if (formValue.stock !== null && formValue.stock !== '' && formValue.stock !== undefined) {
      formData.append('stockQuantity', formValue.stock.toString());
    }
    formData.append('workStation', formValue.workStation);
    
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
