import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories = signal<any[]>([]);
  filteredCategories = signal<any[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  showModal = false;
  editingCategory: any = null;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      icon: [''],
      displayOrder: [0, Validators.required],
      available: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiService.getAllCategories(0, 100).subscribe({
      next: (data: any) => {
        const loaded = Array.isArray(data) ? data : (data && data.content) ? data.content : [];
        this.categories.set(loaded);
        this.filteredCategories.set(loaded);
        this.isLoading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error.set('Erreur lors du chargement des catégories');
        this.isLoading.set(false);
      }
    });
  }

  filterCategories(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredCategories.set(this.categories());
    } else {
      const filtered = this.categories().filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term) ||
        cat.icon?.includes(term)
      );
      this.filteredCategories.set(filtered);
    }
  }

  openCreateModal(): void {
    this.editingCategory = null;
    this.form.reset();
    this.showModal = true;
  }

  editCategory(category: any): void {
    this.editingCategory = category;
    this.form.patchValue({
      name: category.name,
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder,
      available: category.available
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.form.reset();
  }

  saveCategory(): void {
    if (!this.form.valid) return;
    
    this.isSaving.set(true);
    const request = this.form.value;

    if (this.editingCategory) {
      this.apiService.updateCategory(this.editingCategory.publicId, request).subscribe({
        next: () => {
          this.toast.success('Catégorie mise à jour');
          this.closeModal();
          this.loadCategories();
          this.isSaving.set(false);
        },
        error: () => {
          this.error.set('Erreur lors de la mise à jour');
          this.isSaving.set(false);
        }
      });
    } else {
      this.apiService.createCategory(request).subscribe({
        next: () => {
          this.toast.success('Catégorie créée');
          this.closeModal();
          this.loadCategories();
          this.isSaving.set(false);
        },
        error: () => {
          this.error.set('Erreur lors de la création');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleStatus(category: any): void {
    if (category.available) {
      this.apiService.deactivateCategory(category.publicId).subscribe({
        next: () => {
          this.toast.success('Catégorie désactivée');
          this.loadCategories();
        },
        error: () => this.error.set('Erreur lors de la désactivation')
      });
    } else {
      this.apiService.activateCategory(category.publicId).subscribe({
        next: () => {
          this.toast.success('Catégorie activée');
          this.loadCategories();
        },
        error: () => this.error.set('Erreur lors de l\'activation')
      });
    }
  }

  deleteCategory(publicId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) return;
    
    this.apiService.deleteCategory(publicId).subscribe({
      next: () => {
        this.toast.success('Catégorie supprimée');
        // Petit délai pour s'assurer que le serveur a traité la suppression
        setTimeout(() => {
          this.loadCategories();
        }, 300);
      },
      error: (err) => {
        console.error('Delete error:', err);
        
        // Extraire le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la suppression';
        
        // Vérifier le code HTTP et le corps de la réponse
        if (err.status === 409) {
          // CONFLICT - problème avec les dépendances
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.error?.validationErrors?.category) {
            errorMessage = err.error.validationErrors.category;
          }
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        // Afficher le message d'erreur complet
        this.error.set(`⚠️ ${errorMessage}`);
        this.toast.error(errorMessage);
      }
    });
  }
}
