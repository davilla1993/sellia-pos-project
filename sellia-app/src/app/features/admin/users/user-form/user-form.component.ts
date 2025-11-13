import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { PasswordValidator } from '@core/validators/password.validator';
import { PhoneValidator } from '@core/validators/phone.validator';
import { TextTransform } from '@core/utils/text-transform';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
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
  roles = signal<any[]>([]);
  userId: string | null = null;
  showResetPasswordModal = signal(false);
  isResettingPassword = signal(false);
  showResetNewPassword = signal(false);
  showResetConfirmPassword = signal(false);
  resetPasswordForm: FormGroup;

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

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, PasswordValidator.strong()]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    
    // Load roles first, then load user if in edit mode
    this.loadRoles(() => {
      if (this.userId) {
        this.isEditMode.set(true);
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.loadUser();
      }
    });
  }

  private loadRoles(callback?: () => void): void {
    this.apiService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        // Fallback to default roles if API fails
        this.roles.set([
          { id: 1, name: 'ADMIN', description: 'Administrateur' },
          { id: 2, name: 'CAISSE', description: 'Caissier' },
          { id: 3, name: 'CUISINE', description: 'Cuisinier' },
          { id: 4, name: 'BAR', description: 'Barman' }
        ]);
        if (callback) callback();
      }
    });
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
          roleId: user.roleId,
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
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => this.handleError(err)
      });
    } else {
      this.apiService.createUser(transformedData).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isSubmitting.set(false);

    if (err.error?.validationErrors && Object.keys(err.error.validationErrors).length > 0) {
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

  hasResetPasswordError(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getResetPasswordErrorMessage(): string {
    const control = this.resetPasswordForm.get('newPassword');
    if (!control || !control.errors) return 'Requis';
    return PasswordValidator.getErrorMessage(control.errors);
  }

  openResetPasswordModal(): void {
    this.resetPasswordForm.reset();
    this.showResetPasswordModal.set(true);
    this.globalError.set(null);
    this.fieldErrors.set(new Map());
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal.set(false);
    this.showResetNewPassword.set(false);
    this.showResetConfirmPassword.set(false);
    this.resetPasswordForm.reset();
  }

  onResetPassword(): void {
    if (this.resetPasswordForm.invalid || !this.userId) return;

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.globalError.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.isResettingPassword.set(true);
    this.globalError.set(null);
    this.fieldErrors.set(new Map());

    this.apiService.resetPassword(this.userId, newPassword, confirmPassword).subscribe({
      next: () => {
        this.isResettingPassword.set(false);
        this.closeResetPasswordModal();
        alert('Mot de passe réinitialisé avec succès.\n\nL\'utilisateur a été déconnecté immédiatement et devra changer ce mot de passe lors de sa prochaine connexion.');
      },
      error: (err) => {
        this.isResettingPassword.set(false);
        if (err.error?.validationErrors && Object.keys(err.error.validationErrors).length > 0) {
          const errorMap = new Map<string, string>();
          for (const [field, message] of Object.entries(err.error.validationErrors)) {
            errorMap.set(field, message as string);
          }
          this.fieldErrors.set(errorMap);
        } else if (err.error?.message) {
          this.globalError.set(err.error.message);
        } else {
          this.globalError.set('Erreur lors de la réinitialisation du mot de passe');
        }
      }
    });
  }
}
