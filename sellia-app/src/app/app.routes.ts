import { Routes } from '@angular/router';
import { LayoutSimpleComponent } from './shared/components/layout-simple.component';
import { LoginComponent } from './features/auth/login.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { CheckoutSimpleComponent } from './features/customer/checkout-simple.component';
import { OrderTrackingSimpleComponent } from './features/customer/order-tracking-simple.component';
import { QrScannerComponent } from './features/customer/qr-scanner.component';
import { DashboardComponent } from './features/admin/dashboard.component';
import { UsersListComponent } from './features/admin/users/users-list.component';
import { UserFormComponent } from './features/admin/users/user-form.component';
import { ProductsListComponent } from './features/admin/products/products-list.component';
import { ProductFormComponent } from './features/admin/products/product-form.component';
import { OrderEntryComponent } from './features/pos/order-entry.component';
import { KitchenComponent } from './features/pos/kitchen.component';
import { KitchenListComponent } from './features/pos/kitchen-list.component';
import { PendingOrdersComponent } from './features/pos/pending-orders.component';
import { MyOrdersComponent } from './features/pos/my-orders.component';
import { CheckoutComponent } from './features/pos/checkout.component';
import { PosLayoutComponent } from './features/pos/pos-layout.component';
import { InventoryComponent } from './features/admin/inventory.component';
import { TablesComponent } from './features/admin/tables.component';
import { ReportsComponent } from './features/admin/reports.component';
import { SettingsComponent } from './features/admin/settings.component';
import { GlobalSessionComponent } from './features/admin/global-session.component';
import { CashiersComponent } from './features/admin/cashiers.component';
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

  // Admin Routes (with Sidebar)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'users',
        children: [
          { path: '', component: UsersListComponent },
          { path: 'add', component: UserFormComponent },
          { path: ':id/edit', component: UserFormComponent }
        ]
      },
      {
        path: 'products',
        children: [
          { path: '', component: ProductsListComponent },
          { path: 'add', component: ProductFormComponent },
          { path: ':id/edit', component: ProductFormComponent }
        ]
      },
      { path: 'inventory', component: InventoryComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'global-session', component: GlobalSessionComponent },
      { path: 'cashiers', component: CashiersComponent },
      {
        path: 'reports',
        children: [
          { path: '', component: ReportsComponent },
          { path: 'sales', component: ReportsComponent },
          { path: 'products', component: ReportsComponent },
          { path: 'cashiers', component: ReportsComponent },
          { path: 'staff', component: ReportsComponent }
        ]
      },
      { path: 'settings', component: SettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Protected Routes (Require Authentication)
  {
    path: '',
    component: LayoutSimpleComponent,
    canActivate: [authGuard],
    children: [
      // Admin Routes (Legacy)
      {
        path: 'dashboard',
        canActivate: [roleGuard(['ADMIN'])],
        component: DashboardComponent
      },

      // POS Routes (with Sidebar Layout)
      {
        path: 'pos',
        canActivate: [roleGuard(['CAISSE', 'ADMIN', 'CUISINE'])],
        component: PosLayoutComponent,
        children: [
          {
            path: 'order-entry',
            component: OrderEntryComponent
          },
          {
            path: 'pending-orders',
            component: PendingOrdersComponent
          },
          {
            path: 'my-orders',
            component: MyOrdersComponent
          },
          {
            path: 'checkout',
            component: CheckoutComponent
          },
          {
            path: 'kitchen',
            children: [
              { path: '', component: KitchenComponent },
              { path: 'list', component: KitchenListComponent }
            ]
          },
          { path: '', redirectTo: 'order-entry', pathMatch: 'full' }
        ]
      },

      // Customer Routes (QR Code - No Auth)
      {
        path: 'customer',
        children: [
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
