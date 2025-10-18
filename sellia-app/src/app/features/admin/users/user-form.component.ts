import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <a routerLink=".." class="text-primary hover:text-primary-dark font-medium mb-4 inline-block">← Retour</a>
        <h1 class="text-3xl font-bold text-white">{{ isEditMode ? 'Éditer l\'utilisateur' : 'Nouvel utilisateur' }}</h1>
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

        <!-- Username -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Username *</label>
          <input formControlName="username" type="text" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="john_doe" [readonly]="isEditMode">
          <p *ngIf="hasError('username')" class="text-red-400 text-sm mt-1">Requis, 3+ caractères</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Email *</label>
          <input formControlName="email" type="email" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="john@example.com">
          <p *ngIf="hasError('email')" class="text-red-400 text-sm mt-1">Email invalide</p>
        </div>

        <!-- First Name -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Prénom *</label>
          <input formControlName="firstName" type="text" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="Jean">
          <p *ngIf="hasError('firstName')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Nom *</label>
          <input formControlName="lastName" type="text" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="Dupont">
          <p *ngIf="hasError('lastName')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Role -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Rôle *</label>
          <select formControlName="roleId" class="input-field bg-neutral-700 border-neutral-600 text-white">
            <option value="">Sélectionner un rôle</option>
            <option value="ADMIN">Administrateur</option>
            <option value="CAISSE">Caissier</option>
            <option value="CUISINE">Cuisinier</option>
          </select>
          <p *ngIf="hasError('roleId')" class="text-red-400 text-sm mt-1">Requis</p>
        </div>

        <!-- Phone Number -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Téléphone</label>
          <input formControlName="phoneNumber" type="tel" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="+33612345678">
        </div>

        <!-- Password (New User Only) -->
        <div *ngIf="!isEditMode">
          <label class="block text-sm font-semibold text-white mb-2">Mot de passe *</label>
          <input formControlName="password" type="password" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="••••••••">
          <p *ngIf="hasError('password')" class="text-red-400 text-sm mt-1">Requis, 6+ caractères</p>
          <p class="text-neutral-400 text-xs mt-2">Minimum 6 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4">
          <button type="submit" [disabled]="isSubmitting() || form.invalid" class="btn-primary" [class.opacity-50]="isSubmitting() || form.invalid">
            {{ isSubmitting() ? 'En cours...' : isEditMode ? 'Mettre à jour' : 'Créer' }}
          </button>
          <a routerLink=".." class="btn-outline">Annuler</a>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  isEditMode = false;
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  userId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roleId: ['', Validators.required],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId) {
      this.isEditMode = true;
      this.form.get('username')?.disable();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.loadUser();
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    
    this.isLoading.set(true);
    this.apiService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.form.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.role,
          phoneNumber: user.phoneNumber
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement de l\'utilisateur');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue();
    
    if (this.isEditMode && this.userId) {
      this.apiService.updateUser(this.userId, formValue).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la mise à jour');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.apiService.createUser(formValue).subscribe({
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
