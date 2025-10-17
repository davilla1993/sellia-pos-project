import { Routes } from '@angular/router';
import { LayoutSimpleComponent } from './shared/components/layout-simple.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { MenuSimpleComponent } from './features/customer/menu-simple.component';
import { CheckoutSimpleComponent } from './features/customer/checkout-simple.component';
import { OrderTrackingSimpleComponent } from './features/customer/order-tracking-simple.component';
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
    component: LayoutSimpleComponent,
    children: [
      // Customer Routes
      {
        path: 'customer',
        canActivate: [roleGuard(['CUSTOMER'])],
        children: [
          { path: 'menu', component: MenuSimpleComponent },
          { path: 'checkout', component: CheckoutSimpleComponent },
          { path: 'order-tracking/:id', component: OrderTrackingSimpleComponent }
        ]
      },

      // Default redirect
      { path: '', redirectTo: '/customer/menu', pathMatch: 'full' }
    ]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/auth/login' }
];
