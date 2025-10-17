import { Routes } from '@angular/router';
import { LayoutSimpleComponent } from './shared/components/layout-simple.component';
import { LoginComponent } from './features/auth/login.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { MenuSimpleComponent } from './features/customer/menu-simple.component';
import { CheckoutSimpleComponent } from './features/customer/checkout-simple.component';
import { OrderTrackingSimpleComponent } from './features/customer/order-tracking-simple.component';
import { QrScannerComponent } from './features/customer/qr-scanner.component';
import { DashboardComponent } from './features/admin/dashboard.component';
import { CashierComponent } from './features/pos/cashier.component';
import { KitchenComponent } from './features/pos/kitchen.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Routes (No Auth Required)
  {
    path: 'scan',
    component: QrScannerComponent
  },

  // Auth Routes (No Layout)
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Protected Routes (Require Authentication)
  {
    path: '',
    component: LayoutSimpleComponent,
    canActivate: [authGuard],
    children: [
      // Admin Routes
      {
        path: 'dashboard',
        canActivate: [roleGuard(['ADMIN'])],
        component: DashboardComponent
      },

      // POS Routes
      {
        path: 'pos',
        children: [
          {
            path: 'cashier',
            canActivate: [roleGuard(['CAISSE', 'ADMIN'])],
            component: CashierComponent
          },
          {
            path: 'kitchen',
            canActivate: [roleGuard(['CUISINE', 'ADMIN'])],
            component: KitchenComponent
          }
        ]
      },

      // Customer Routes (QR Code - No Auth)
      {
        path: 'customer',
        children: [
          { path: 'menu', component: MenuSimpleComponent },
          { path: 'checkout', component: CheckoutSimpleComponent },
          { path: 'order-tracking/:id', component: OrderTrackingSimpleComponent }
        ]
      },

      // Default redirect based on role
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/auth/login' }
];
