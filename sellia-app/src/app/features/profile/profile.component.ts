import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { PasswordValidator } from '@core/validators/password.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  changePasswordForm: FormGroup;
  isSubmitting = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  globalError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Map<string, string>>(new Map());

  currentUser = signal<any>(null);

  constructor() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, PasswordValidator.strong()]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
  }

  onChangePassword(): void {
    if (this.changePasswordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.globalError.set('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    this.isSubmitting.set(true);
    this.globalError.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set(new Map());

    this.apiService.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Mot de passe changé avec succès !');
        this.changePasswordForm.reset();

        // Auto-dismiss success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
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
          this.globalError.set('Une erreur est survenue lors du changement de mot de passe');
        }
      }
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPasswordErrorMessage(): string {
    const control = this.changePasswordForm.get('newPassword');
    if (!control || !control.errors) return 'Requis';
    return PasswordValidator.getErrorMessage(control.errors);
  }

  getFieldErrorsList(): string[] {
    const errors: string[] = [];
    this.fieldErrors().forEach((message, field) => {
      errors.push(`${field}: ${message}`);
    });
    return errors;
  }
}
