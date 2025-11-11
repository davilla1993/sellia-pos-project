import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { RestaurantInfoService } from '@shared/services/restaurant-info.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  restaurantService = inject(RestaurantInfoService);

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

  ngOnInit(): void {
    this.restaurantService.loadRestaurantInfo();
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
