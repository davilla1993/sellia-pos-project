import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { PasswordValidator } from '../../../core/validators/password.validator';
import { PhoneValidator } from '../../../core/validators/phone.validator';
import { TextTransform } from '../../../core/utils/text-transform';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <a routerLink="/admin/users" class="text-primary hover:text-primary-dark font-medium mb-4 inline-block">← Retour</a>
        <h1 class="text-3xl font-bold text-white">{{ isEditMode() ? "Éditer l'utilisateur" : "Nouvel utilisateur" }}</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Form -->
      <form *ngIf="!isLoading()" [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-neutral-800 rounded-lg border border-neutral-700 p-6 max-w-2xl space-y-6">
        
        <!-- Global Error -->
        <div *ngIf="globalError()" class="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
          {{ globalError() }}
        </div>

        <!-- Field Validation Errors -->
        <div *ngIf="fieldErrors().size > 0" class="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p class="text-red-200 font-semibold mb-2">Erreurs de validation:</p>
          <ul class="text-red-200 text-sm space-y-1">
            <li *ngFor="let error of getFieldErrorsList()" class="flex items-start gap-2">
              <span class="text-red-400 mt-0.5">•</span>
              <span>{{ error }}</span>
            </li>
          </ul>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-sm font-semibold text-white mb-2">Nom d'utilisateur *</label>
          <input formControlName="username" type="text" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500" placeholder="john_doe" [readonly]="isEditMode()">
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
          <p *ngIf="hasError('phoneNumber')" class="text-red-400 text-sm mt-1">{{ getPhoneErrorMessage() }}</p>
        </div>

        <!-- Password (New User Only) -->
        <div *ngIf="!isEditMode()">
          <label class="block text-sm font-semibold text-white mb-2">Mot de passe *</label>
          <div class="relative">
            <input formControlName="password" [type]="showPassword() ? 'text' : 'password'" class="input-field bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500 pr-12" placeholder="••••••••">
            <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors" title="Afficher/Masquer">
              <svg *ngIf="!showPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg *ngIf="showPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.921 19.402A8.971 8.971 0 0020 16m.94-9m-16 6c1.274-4.057 5.065-7 9.541-7 1.52 0 2.997.255 4.406.744M3 3l18 18"></path>
              </svg>
            </button>
          </div>
          <p *ngIf="hasError('password')" class="text-red-400 text-sm mt-1">
            {{ getPasswordErrorMessage() }}
          </p>
          <p class="text-neutral-400 text-xs mt-2">Minimum 6 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4">
          <button type="submit" [disabled]="isSubmitting() || form.invalid" class="btn-primary" [class.opacity-50]="isSubmitting() || form.invalid">
            {{ isSubmitting() ? "En cours..." : isEditMode() ? "Mettre à jour" : "Créer" }}
          </button>
          <a routerLink="/admin/users" class="btn-outline">Annuler</a>
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
  isEditMode = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  showPassword = signal(false);
  globalError = signal<string | null>(null);
  fieldErrors = signal<Map<string, string>>(new Map());
  userId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roleId: ['', Validators.required],
      phoneNumber: ['', PhoneValidator.validFormat()],
      password: ['', [Validators.required, PasswordValidator.strong()]]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId) {
      this.isEditMode.set(true);
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
        this.globalError.set('Erreur lors du chargement de l\'utilisateur');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.globalError.set(null);
    this.fieldErrors.set(new Map());

    const formValue = this.form.getRawValue();
    
    // Transform data before sending
    const transformedData = {
      ...formValue,
      firstName: TextTransform.capitalize(formValue.firstName),
      lastName: TextTransform.toUpperCase(formValue.lastName),
      phoneNumber: TextTransform.onlyNumbers(formValue.phoneNumber)
    };
    
    if (this.isEditMode() && this.userId) {
      this.apiService.updateUser(this.userId, transformedData).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: (err) => this.handleError(err)
      });
    } else {
      this.apiService.createUser(transformedData).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isSubmitting.set(false);

    if (err.error?.validationErrors) {
      const errorMap = new Map<string, string>();
      for (const [field, message] of Object.entries(err.error.validationErrors)) {
        errorMap.set(field, message as string);
      }
      this.fieldErrors.set(errorMap);
    } else if (err.error?.message) {
      this.globalError.set(err.error.message);
    } else {
      this.globalError.set('Une erreur est survenue lors du traitement');
    }
  }

  getFieldErrorsList(): string[] {
    const errors: string[] = [];
    this.fieldErrors().forEach((message, field) => {
      errors.push(`${field}: ${message}`);
    });
    return errors;
  }

  getPasswordErrorMessage(): string {
    const control = this.form.get('password');
    if (!control || !control.errors) return 'Requis';
    return PasswordValidator.getErrorMessage(control.errors);
  }

  getPhoneErrorMessage(): string {
    const control = this.form.get('phoneNumber');
    if (!control || !control.errors) return '';
    
    if (control.errors['phoneInvalid']) {
      return 'Le téléphone ne doit contenir que des chiffres';
    }
    if (control.errors['phoneLength']) {
      return 'Le téléphone doit contenir entre 7 et 20 chiffres';
    }
    return 'Téléphone invalide';
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
