import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center bg-neutral-800 border-b border-neutral-700 px-6 py-4 -mx-8 -mt-6 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">Catégories</h1>
          <p class="text-neutral-400 text-sm mt-1">Gérez les catégories de produits</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary">+ Nouvelle Catégorie</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
        {{ error() }}
      </div>

      <!-- Categories Table -->
      <div *ngIf="!isLoading() && categories().length > 0" class="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table class="w-full">
          <thead class="bg-neutral-700 border-b border-neutral-600">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Icône</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Nom</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Description</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Ordre</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Statut</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories()" class="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
              <td class="px-6 py-4 text-2xl">
                {{ category.icon || '📁' }}
              </td>
              <td class="px-6 py-4">
                <p class="text-white font-semibold">{{ category.name }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-xs text-neutral-400 truncate">{{ category.description }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-white text-sm">{{ category.displayOrder }}</p>
              </td>
              <td class="px-6 py-4">
                <span [class]="category.available ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'" class="px-2 py-1 rounded text-xs font-semibold">
                  {{ category.available ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 space-x-2 flex flex-wrap gap-2">
                <button (click)="editCategory(category)" class="text-primary hover:text-primary-dark text-sm font-medium">✏️ Éditer</button>
                <button 
                  (click)="toggleStatus(category)"
                  [class]="category.available ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'"
                  class="text-sm font-medium">
                  {{ category.available ? '🔒 Désactiver' : '🔓 Activer' }}
                </button>
                <button (click)="deleteCategory(category.publicId)" class="text-red-400 hover:text-red-300 text-sm font-medium">🗑️ Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && categories().length === 0" class="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
        <p class="text-neutral-400 mb-4">Aucune catégorie trouvée</p>
        <button (click)="openCreateModal()" class="text-primary hover:text-primary-dark font-medium">Créer la première catégorie</button>
      </div>

      <!-- Category Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-neutral-800 rounded-lg p-8 max-w-2xl w-full mx-4 border border-neutral-700 max-h-screen overflow-y-auto">
          <h2 class="text-2xl font-bold text-white mb-6">{{ editingCategory ? 'Éditer Catégorie' : 'Nouvelle Catégorie' }}</h2>
          
          <form [formGroup]="form" (ngSubmit)="saveCategory()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Nom *</label>
                <input formControlName="name" type="text" class="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500" placeholder="Nom de la catégorie">
              </div>

              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Statut</label>
                <div class="flex items-center gap-3 h-11 px-4 py-3 bg-neutral-700 border border-neutral-600 rounded">
                  <input 
                    type="checkbox" 
                    formControlName="available"
                    class="w-5 h-5 rounded cursor-pointer">
                  <span class="text-white">{{ form.get('available')?.value ? 'Actif' : 'Inactif' }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-neutral-300 mb-2">Description</label>
              <textarea 
                formControlName="description" 
                class="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 h-32 resize-none" 
                placeholder="Description détaillée de la catégorie..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Icône</label>
                <input 
                  formControlName="icon" 
                  type="text" 
                  class="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500" 
                  placeholder="ex: 🍕, 🍔, 🥗">
              </div>

              <div>
                <label class="block text-sm font-semibold text-neutral-300 mb-2">Ordre d'affichage *</label>
                <input 
                  formControlName="displayOrder" 
                  type="number" 
                  class="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500" 
                  placeholder="0">
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-semibold transition-colors">
                Annuler
              </button>
              <button 
                type="submit" 
                [disabled]="!form.valid || isSaving()" 
                class="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-semibold transition-colors">
                {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CategoriesListComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories = signal<any[]>([]);
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
