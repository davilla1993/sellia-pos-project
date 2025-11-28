import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RestaurantInfoService } from '@shared/services/restaurant-info.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  warningMessage = signal<string | null>(null);
  rateLimitError = signal(false);
  restaurantService = inject(RestaurantInfoService);

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

  ngOnInit(): void {
    this.restaurantService.loadRestaurantInfo();

    // Check if user was logged out due to token revocation
    const logoutReason = sessionStorage.getItem('logoutReason');
    if (logoutReason === 'session_revoked') {
      this.warningMessage.set('Votre session a été fermée car une nouvelle connexion a été détectée depuis un autre appareil ou navigateur.');
      sessionStorage.removeItem('logoutReason');

      // Clear warning after 10 seconds
      setTimeout(() => {
        this.warningMessage.set(null);
      }, 10000);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.rateLimitError.set(false);
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

        // Handle rate limiting (429 Too Many Requests)
        if (err.status === 429) {
          this.rateLimitError.set(true);
          const retryAfter = err.error?.retryAfter || 180; // Default 2 minutes
          const minutes = Math.floor(retryAfter / 60);
          this.error.set(`Trop de tentatives de connexion échouées. Pour votre sécurité, veuillez réessayer dans ${minutes} minute${minutes > 1 ? 's' : ''}.`);
        } else {
          this.rateLimitError.set(false);
          const errorMsg = err.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect.';
          this.error.set(errorMsg);
        }
      }
    });
  }

  private navigateByRole(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'CAISSE': '/auth/cashier-pin',  // Redirect to PIN validation for cashiers
      'CUISINE': '/pos/kitchen',
      'BAR': '/pos/bar',
      'AUDITOR': '/auditor/dashboard'
    };

    const route = roleRoutes[role] || '/admin/dashboard';
    this.router.navigate([route]);
  }

  getFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
