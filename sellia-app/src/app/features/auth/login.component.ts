import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
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

        <!-- Login Form -->
        <div class="card shadow-elevation">
          <h2 class="text-2xl font-bold text-dark mb-6">Staff Login</h2>

          <!-- Error Message -->
          <div *ngIf="error()" class="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p class="font-semibold">{{ error() }}</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-semibold text-dark mb-2">Username</label>
              <input
                id="username"
                type="text"
                formControlName="username"
                class="input-field"
                placeholder="your username"
                [disabled]="isLoading()"
              />
              <div *ngIf="getFieldError('username')" class="text-red-500 text-sm mt-1">
                Username is required
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-semibold text-dark mb-2">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="input-field"
                placeholder="••••••••"
                [disabled]="isLoading()"
              />
              <div *ngIf="getFieldError('password')" class="text-red-500 text-sm mt-1">
                Password is required
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading() || loginForm.invalid"
              class="btn-primary w-full mt-6"
              [class.opacity-50]="isLoading() || loginForm.invalid"
            >
              {{ isLoading() ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <!-- Info -->
          <div class="mt-6 text-center border-t border-neutral-200 pt-4">
            <p class="text-sm text-neutral-600">
              Staff accounts are created by administrators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const user = response.user;

        // Check if first login - must change password
        if (user.firstLogin) {
          this.router.navigate(['/auth/change-password']);
        } else {
          // Navigate based on role
          this.navigateByRole(user.role);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.message || 'Invalid email or password.';
        this.error.set(errorMsg);
      }
    });
  }

  private navigateByRole(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      'ADMIN': '/dashboard',
      'CAISSIER': '/pos/cashier',
      'CUISINE': '/pos/kitchen'
    };

    const route = roleRoutes[role] || '/dashboard';
    this.router.navigate([route]);
  }

  getFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
