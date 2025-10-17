import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="section-header">
        <h1 class="section-title">Admin Dashboard</h1>
        <p class="section-subtitle">Manage your restaurant</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-neutral-600 text-sm">Total Revenue</p>
              <p class="text-3xl font-bold text-primary mt-2">$0</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-neutral-600 text-sm">Orders Today</p>
              <p class="text-3xl font-bold text-primary mt-2">0</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-neutral-600 text-sm">Low Stock Items</p>
              <p class="text-3xl font-bold text-red-500 mt-2">0</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-neutral-600 text-sm">Active Users</p>
              <p class="text-3xl font-bold text-primary mt-2">0</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="w-full btn-primary text-left">Create New User</button>
            <button class="w-full btn-secondary text-left">Manage Products</button>
            <button class="w-full btn-secondary text-left">View Reports</button>
            <button class="w-full btn-secondary text-left">Settings</button>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">Recent Activity</h2>
          <p class="text-neutral-600 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {}
