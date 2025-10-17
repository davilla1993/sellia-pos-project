import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center px-4">
      <div class="w-full max-w-md animate-slide-up">
        <!-- Logo Section -->
        <div class="text-center mb-8">
          <img src="/assets/logo.jpg" alt="Maison Recla" class="h-24 w-24 rounded-2xl mx-auto mb-4 shadow-elegant">
          <h1 class="text-4xl font-bold text-dark mb-2">Maison Recla</h1>
          <p class="text-neutral-600">Create Your Account</p>
        </div>

        <!-- Register Form -->
        <div class="card shadow-elevation">
          <h2 class="text-2xl font-bold text-dark mb-6">Sign Up</h2>

          <!-- Error Message -->
          <div *ngIf="error()" class="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {{ error() }}
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- First Name -->
            <div>
              <label for="firstName" class="block text-sm font-semibold text-dark mb-2">First Name</label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                class="input-field"
                placeholder="John"
              />
            </div>

            <!-- Last Name -->
            <div>
              <label for="lastName" class="block text-sm font-semibold text-dark mb-2">Last Name</label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                class="input-field"
                placeholder="Doe"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold text-dark mb-2">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input-field"
                placeholder="your@email.com"
              />
              <div *ngIf="getFieldError('email')" class="text-red-500 text-sm mt-1">
                Please enter a valid email
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
              />
              <div *ngIf="getFieldError('password')" class="text-red-500 text-sm mt-1">
                Password must be at least 6 characters
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
              />
              <div *ngIf="getFieldError('confirmPassword')" class="text-red-500 text-sm mt-1">
                Passwords do not match
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading() || registerForm.invalid"
              class="btn-primary w-full mt-6"
              [class.opacity-50]="isLoading()"
            >
              {{ isLoading() ? 'Creating account...' : 'Register' }}
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center border-t border-neutral-200 pt-4">
            <p class="text-neutral-600">
              Already have an account?
              <a routerLink="/auth/login" class="text-primary font-semibold hover:text-primary-dark transition">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { firstName, lastName, email, password } = this.registerForm.value;

    this.authService.register(email, password, firstName, lastName).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  getFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
