import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.getToken()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (authService.hasRole(requiredRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
