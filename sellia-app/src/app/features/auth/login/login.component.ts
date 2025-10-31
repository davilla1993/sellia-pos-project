import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

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

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.loginForm.disable();

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const user = response.user;

        // Check if first login - must change password for all roles
        if (user.firstLogin) {
          this.router.navigate(['/auth/change-password']);
        } else {
          // Navigate based on role
          this.navigateByRole(user.role);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loginForm.enable();
        const errorMsg = err.error?.message || 'Invalid username or password.';
        this.error.set(errorMsg);
      }
    });
  }

  private navigateByRole(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'CAISSE': '/pos/order-entry',
      'CUISINE': '/pos/kitchen',
      'BAR': '/pos/bar'
    };

    const route = roleRoutes[role] || '/admin/dashboard';
    this.router.navigate([route]);
  }

  getFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
