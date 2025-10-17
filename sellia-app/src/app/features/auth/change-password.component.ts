import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
              <input
                id="oldPassword"
                type="password"
                formControlName="oldPassword"
                class="input-field"
                placeholder="••••••••"
                [disabled]="isLoading()"
              />
              <div *ngIf="getFieldError('oldPassword')" class="text-red-500 text-sm mt-1">
                Current password is required
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-semibold text-dark mb-2">New Password</label>
              <input
                id="newPassword"
                type="password"
                formControlName="newPassword"
                class="input-field"
                placeholder="••••••••"
                [disabled]="isLoading()"
              />
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
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="input-field"
                placeholder="••••••••"
                [disabled]="isLoading()"
              />
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

    const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    this.authService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set('Password changed successfully. Redirecting...');
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          if (user) {
            const roleRoutes: { [key: string]: string } = {
              'ADMIN': '/dashboard',
              'CAISSIER': '/pos/cashier',
              'CUISINIER': '/pos/kitchen'
            };
            const route = roleRoutes[user.role] || '/dashboard';
            this.router.navigate([route]);
          }
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to change password.');
      }
    });
  }

  getFieldError(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
