import { Routes } from '@angular/router';
import { LayoutSimpleComponent } from './shared/components/layout-simple/layout-simple.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { CashierPinComponent } from './features/auth/cashier-pin/cashier-pin.component';
import { CheckoutSimpleComponent } from './features/customer/checkout-simple/checkout-simple.component';
import { OrderTrackingSimpleComponent } from './features/customer/order-tracking-simple/order-tracking-simple.component';
import { QrScannerComponent } from './features/customer/qr-scanning/qr-scanner.component';
import { PublicMenuComponent } from './features/public/public-menu.component';
import { DashboardComponent } from './features/admin/admin-dashboard/dashboard.component';
import { UsersListComponent } from './features/admin/users/user-list/users-list.component';
import { UserFormComponent } from './features/admin/users/user-form/user-form.component';
import { ProductsListComponent } from './features/admin/products/product-list/products-list.component';
import { ProductFormComponent } from './features/admin/products/product-form/product-form.component';
import { OrderEntryComponent } from './features/pos/order-entry/order-entry.component';
import { KitchenComponent } from './features/pos/kitchen/kitchen.component';
import { BarComponent } from './features/pos/bar/bar.component';
import { PendingOrdersComponent } from './features/pos/pending-orders/pending-orders.component';
import { MyOrdersComponent } from './features/pos/my-orders/my-orders.component';
import { CheckoutComponent } from './features/pos/checkout/checkout.component';
import { PosLayoutComponent } from './features/pos/pos-layout/pos-layout.component';
import { InventoryComponent } from './features/admin/inventory/inventory.component';

import { ReportsComponent } from './features/admin/reports/reports.component';
import { SettingsComponent } from './features/admin/settings.component';
import { GlobalSessionComponent } from './features/admin/global-session/global-session.component';
import { CashiersComponent } from './features/admin/cashiers/cashiers.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { cashierSessionGuard } from './core/guards/cashier-session.guard';
import { AuditorDashboardComponent } from './features/auditor/auditor-dashboard/auditor-dashboard.component';
import { AuditLogsComponent } from './features/auditor/audit-logs/audit-logs.component';
import { RetentionManagementComponent } from './features/auditor/retention-management/retention-management.component';
import { ApplicationLogsComponent } from './features/auditor/application-logs/application-logs.component';

export const routes: Routes = [
  // Public Routes (No Auth Required)
  {
    path: 'qr/:token',
    component: PublicMenuComponent
  },
  {
    path: 'menu',
    component: PublicMenuComponent
  },
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
      { path: 'cashier-pin', component: CashierPinComponent, canActivate: [authGuard, roleGuard(['CAISSE'])] },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Admin Routes (with Sidebar)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
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
          {
            path: 'catalog',
            children: [
              { path: '', component: ProductsListComponent },
              { path: 'add', component: ProductFormComponent },
              { path: ':id/edit', component: ProductFormComponent }
            ]
          },
          {
            path: 'categories',
            loadComponent: () => import('./features/admin/categories/categories-list.component').then(m => m.CategoriesListComponent)
          },
          { path: '', redirectTo: 'catalog', pathMatch: 'full' }
        ]
      },
      { path: 'inventory', component: InventoryComponent },
      {
        path: 'tables',
        loadComponent: () => import('./features/admin/tables/tables.component').then(m => m.TablesComponent)
      },
      { path: 'global-session', component: GlobalSessionComponent },
      {
        path: 'cashiers',
        children: [
          { path: '', component: CashiersComponent },
          {
            path: 'assignment',
            loadComponent: () => import('./features/admin/cashiers/cashier-assignment/cashier-assignment.component').then(m => m.CashierAssignmentComponent)
          }
        ]
      },
      {
        path: 'reports',
        children: [
          { path: '', component: ReportsComponent },
          { path: 'sales', component: ReportsComponent },
          { path: 'products', component: ReportsComponent },
          { path: 'cashiers', component: ReportsComponent },
          { path: 'staff', component: ReportsComponent },
          { path: 'sessions', component: ReportsComponent }
        ]
      },
      {
        path: 'search-invoice',
        loadComponent: () => import('./features/admin/search-invoice/search-invoice.component').then(m => m.SearchInvoiceComponent)
      },
      { path: 'settings', component: SettingsComponent },
      {
        path: 'menus',
        loadComponent: () => import('./features/admin/menus/menus.component').then(m => m.MenusComponent)
      },
      {
        path: 'active-sessions',
        loadComponent: () => import('./features/admin/active-sessions/active-sessions.component').then(m => m.ActiveSessionsComponent)
      },
      {
        path: 'active-orders',
        loadComponent: () => import('./features/admin/active-orders/active-orders.component').then(m => m.ActiveOrdersComponent)
      },
      {
        path: 'cash-operations',
        loadComponent: () => import('./features/admin/cash-operations/cash-operations.component').then(m => m.CashOperationsComponent)
      },
      {
        path: 'stock-alerts',
        loadComponent: () => import('./features/admin/stock-alerts/stock-alerts.component').then(m => m.StockAlertsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Auditor Routes (with Sidebar)
  {
    path: 'auditor',
    canActivate: [authGuard, roleGuard(['AUDITOR', 'ADMIN'])],
    loadComponent: () => import('./features/auditor/auditor-layout/auditor-layout.component').then(m => m.AuditorLayoutComponent),
    children: [
      { path: 'dashboard', component: AuditorDashboardComponent },
      { path: 'audit-logs', component: AuditLogsComponent },
      { path: 'application-logs', component: ApplicationLogsComponent },
      { path: 'retention', component: RetentionManagementComponent },
      { path: 'profile', component: ProfileComponent },
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
        canActivate: [roleGuard(['CAISSE', 'ADMIN', 'CUISINE', 'BAR']), cashierSessionGuard],
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
            canActivate: [roleGuard(['CUISINE', 'BAR', 'ADMIN'])],
            component: KitchenComponent
          },
          {
            path: 'bar',
            canActivate: [roleGuard(['CUISINE', 'BAR', 'ADMIN'])],
            component: BarComponent
          },
          {
            path: 'profile',
            component: ProfileComponent
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
