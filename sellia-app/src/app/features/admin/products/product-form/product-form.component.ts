import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
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
