import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { MenuComponent } from './features/customer/menu.component';
import { CheckoutComponent } from './features/customer/checkout.component';
import { OrderTrackingComponent } from './features/customer/order-tracking.component';
import { QrScannerComponent } from './features/customer/qr-scanner.component';
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
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Layout Routes
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Customer Routes
      {
        path: 'customer',
        canActivate: [roleGuard(['CUSTOMER'])],
        children: [
          { path: 'menu', component: MenuComponent },
          { path: 'checkout', component: CheckoutComponent },
          { path: 'order-tracking/:id', component: OrderTrackingComponent }
        ]
      },

      // Placeholder Admin/Cashier Routes (to implement)
      {
        path: 'dashboard',
        canActivate: [roleGuard(['ADMIN', 'CAISSIER', 'CUISINIER'])],
        component: MenuComponent // Temporary - will be replaced with DashboardComponent
      },
      {
        path: 'orders',
        canActivate: [roleGuard(['ADMIN', 'CAISSIER', 'CUISINIER'])],
        component: MenuComponent // Temporary - will be replaced
      },
      {
        path: 'stock',
        canActivate: [roleGuard(['ADMIN'])],
        component: MenuComponent // Temporary - will be replaced
      },
      {
        path: 'reports',
        canActivate: [roleGuard(['ADMIN'])],
        component: MenuComponent // Temporary - will be replaced
      },

      // Default redirect
      { path: '', redirectTo: '/customer/menu', pathMatch: 'full' }
    ]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/auth/login' }
];
