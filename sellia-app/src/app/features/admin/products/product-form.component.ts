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
        <a routerLink=".." class="text-primary hover:text-primary-dark font-medium mb-4 inline-block">← Retour</a>
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
          <label class="block text-sm font-semibold text-white mb-3">Image du Produit</label>
          <div class="space-y-3">
            <!-- Preview -->
            <div *ngIf="imagePreview()" class="relative w-48 h-48 rounded-lg border border-neutral-600 overflow-hidden bg-neutral-700">
              <img [src]="imagePreview()" alt="Preview" class="w-full h-full object-cover">
              <button type="button" (click)="clearImage()" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Upload Input -->
            <input #fileInput type="file" accept="image/*" (change)="onImageSelected($event)" class="hidden">
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
          <textarea formControlName="description" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500 h-24" placeholder="Descrição du produit..."></textarea>
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Prix (€) *</label>
          <input formControlName="price" type="number" step="0.01" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="12.99">
          <p *ngIf="hasError('price')" class="text-red-400 text-sm mt-1">Requis, doit être > 0</p>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Catégorie *</label>
          <select formControlName="categoryId" class="input-field bg-neutral-700 border-neutral-600 text-white">
            <option value="">Sélectionner une catégorie</option>
            <option value="1">Pizzas</option>
            <option value="2">Pâtes</option>
            <option value="3">Salades</option>
            <option value="4">Boissons</option>
            <option value="5">Desserts</option>
          </select>
          <p *ngIf="hasError('categoryId')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Stock -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Quantité en Stock *</label>
          <input formControlName="stock" type="number" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="0">
          <p *ngIf="hasError('stock')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4">
          <button type="submit" [disabled]="isSubmitting() || form.invalid" class="btn-primary" [class.opacity-50]="isSubmitting() || form.invalid">
            {{ isSubmitting() ? "En cours..." : isEditMode() ? "Mettre à jour" : "Créer" }}
          </button>
          <a routerLink=".." class="btn-outline">Annuler</a>
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
  selectedImage: File | null = null;
  productId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    
    if (this.productId) {
      this.isEditMode.set(true);
      this.loadProduct();
    }
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.isLoading.set(true);
    this.apiService.getProductByIdAdmin(this.productId).subscribe({
      next: (product) => {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          price: product.price / 100,
          categoryId: product.categoryId,
          stock: product.stock
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
      
      if (!file.type.startsWith('image/')) {
        this.error.set('Veuillez sélectionner une image');
        return;
      }

      this.selectedImage = file;
      
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
    formData.append('price', Math.round(formValue.price * 100).toString());
    formData.append('categoryId', formValue.categoryId);
    formData.append('stock', formValue.stock);
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.isEditMode() && this.productId) {
      this.apiService.updateProduct(this.productId, formData).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la mise à jour');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.apiService.createProduct(formData).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la création');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
