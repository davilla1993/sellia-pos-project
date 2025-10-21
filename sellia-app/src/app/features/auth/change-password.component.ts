import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center px-4">
      <div class="w-full max-w-md animate-slide-up">
        <!-- Logo Section -->
        <div class="text-center mb-8">
          <img src="/assets/logo.jpg" alt="Maison Recla" class="h-24 w-24 rounded-2xl mx-auto mb-4 shadow-elegant">
          <h1 class="text-4xl font-bold text-dark mb-2">Maison Recla</h1>
          <p class="text-neutral-600">POS Management System</p>
        </div>

        <!-- Change Password Form -->
        <div class="card shadow-elevation">
          <h2 class="text-2xl font-bold text-dark mb-2">Change Password</h2>
          <p class="text-neutral-600 mb-6">Your account requires a new password on first login.</p>

          <!-- Error Message -->
          <div *ngIf="error()" class="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p class="font-semibold">{{ error() }}</p>
          </div>

          <!-- Success Message -->
          <div *ngIf="success()" class="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            <p class="font-semibold">{{ success() }}</p>
          </div>

          <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Current Password -->
            <div>
              <label for="oldPassword" class="block text-sm font-semibold text-dark mb-2">Current Password</label>
              <div class="relative">
                <input
                  id="oldPassword"
                  [type]="showOldPassword() ? 'text' : 'password'"
                  formControlName="oldPassword"
                  class="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="toggleOldPasswordVisibility()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-primary transition-colors"
                  [attr.aria-label]="showOldPassword() ? 'Hide password' : 'Show password'"
                >
                  <svg *ngIf="!showOldPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showOldPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.338-12.202a10.079 10.079 0 015.802 2.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
              <div *ngIf="getFieldError('oldPassword')" class="text-red-500 text-sm mt-1">
                Current password is required
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-semibold text-dark mb-2">New Password</label>
              <div class="relative">
                <input
                  id="newPassword"
                  [type]="showNewPassword() ? 'text' : 'password'"
                  formControlName="newPassword"
                  class="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="toggleNewPasswordVisibility()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-primary transition-colors"
                  [attr.aria-label]="showNewPassword() ? 'Hide password' : 'Show password'"
                >
                  <svg *ngIf="!showNewPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showNewPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.338-12.202a10.079 10.079 0 015.802 2.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
              <div *ngIf="getFieldError('newPassword')" class="text-red-500 text-sm mt-1">
                <span *ngIf="changePasswordForm.get('newPassword')?.hasError('required')">New password is required</span>
                <span *ngIf="changePasswordForm.get('newPassword')?.hasError('minlength')">Minimum 6 characters</span>
                <span *ngIf="changePasswordForm.get('newPassword')?.hasError('pattern')">
                  Must contain uppercase, number, and special character
                </span>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-semibold text-dark mb-2">Confirm Password</label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-primary transition-colors"
                  [attr.aria-label]="showConfirmPassword() ? 'Hide password' : 'Show password'"
                >
                  <svg *ngIf="!showConfirmPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showConfirmPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.338-12.202a10.079 10.079 0 015.802 2.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
              <div *ngIf="getFieldError('confirmPassword')" class="text-red-500 text-sm mt-1">
                Passwords do not match
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading() || changePasswordForm.invalid"
              class="btn-primary w-full mt-6"
              [class.opacity-50]="isLoading() || changePasswordForm.invalid"
            >
              {{ isLoading() ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  private apiService = inject(ApiService);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        ]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  toggleOldPasswordVisibility(): void {
    this.showOldPassword.set(!this.showOldPassword());
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);
    this.changePasswordForm.disable();

    const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    this.authService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set('Password changed successfully. Redirecting...');
        
        const user = this.authService.getCurrentUser();
        if (user) {
          // Mark first login complete on backend
          this.apiService.markFirstLoginComplete(user.publicId).subscribe({
            next: () => {
              user.firstLogin = false;
              this.authService.saveUserToStorage(user);

              setTimeout(() => {
                const roleRoutes: { [key: string]: string } = {
                  'ADMIN': '/admin/dashboard',
                  'CAISSE': '/pos/order-entry',
                  'CUISINE': '/pos/kitchen'
                };
                const route = roleRoutes[user.role] || '/admin/dashboard';
                this.router.navigate([route]);
              }, 1500);
            },
            error: (err) => {
              console.error('Error marking first login complete:', err);
              // Still redirect even if marking fails
              setTimeout(() => {
                const roleRoutes: { [key: string]: string } = {
                  'ADMIN': '/admin/dashboard',
                  'CAISSE': '/pos/order-entry',
                  'CUISINE': '/pos/kitchen'
                };
                const route = roleRoutes[user.role] || '/admin/dashboard';
                this.router.navigate([route]);
              }, 1500);
            }
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.changePasswordForm.enable();
        this.error.set(err.error?.message || 'Failed to change password.');
      }
    });
  }

  getFieldError(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
