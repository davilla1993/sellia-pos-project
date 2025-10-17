import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="section-header">
        <h1 class="section-title">POS - Cashier</h1>
        <p class="section-subtitle">Manage orders and payments</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <p class="text-neutral-600 text-sm">Today's Sales</p>
          <p class="text-3xl font-bold text-primary mt-2">$0</p>
        </div>
        <div class="card">
          <p class="text-neutral-600 text-sm">Orders Today</p>
          <p class="text-3xl font-bold text-primary mt-2">0</p>
        </div>
        <div class="card">
          <p class="text-neutral-600 text-sm">Pending Orders</p>
          <p class="text-3xl font-bold text-yellow-500 mt-2">0</p>
        </div>
        <div class="card">
          <p class="text-neutral-600 text-sm">Ready for Pickup</p>
          <p class="text-3xl font-bold text-green-500 mt-2">0</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <h2 class="text-xl font-bold text-dark mb-4">Active Orders</h2>
          <div class="text-center py-12">
            <p class="text-neutral-600">No active orders</p>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="w-full btn-primary">New Order</button>
            <button class="w-full btn-secondary">View Menu</button>
            <button class="w-full btn-secondary">Payment</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CashierComponent {}
