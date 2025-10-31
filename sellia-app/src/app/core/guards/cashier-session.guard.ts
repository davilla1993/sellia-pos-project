import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CashierSessionService } from '@core/services/cashier-session.service';
import { AuthService } from '@core/services/auth.service';
import { map, take } from 'rxjs/operators';

export const cashierSessionGuard = () => {
  const cashierSessionService = inject(CashierSessionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get current user role
  const currentUser = authService.getCurrentUser();

  // If not a cashier, allow access (other roles don't need cashier session)
  if (currentUser?.role !== 'CAISSE') {
    return true;
  }

  // For cashiers, check if they have an active session
  return cashierSessionService.sessionStatus$.pipe(
    take(1),
    map(status => {
      if (status === 'OPEN') {
        return true;
      } else {
        // Redirect to PIN entry if no active session
        router.navigate(['/auth/cashier-pin']);
        return false;
      }
    })
  );
};
