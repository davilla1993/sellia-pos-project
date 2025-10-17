import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="section-header">
        <h1 class="section-title">POS - Kitchen</h1>
        <p class="section-subtitle">Manage order preparation</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card border-l-4 border-yellow-500">
          <p class="text-neutral-600 text-sm">Pending Orders</p>
          <p class="text-3xl font-bold text-yellow-500 mt-2">0</p>
        </div>
        <div class="card border-l-4 border-blue-500">
          <p class="text-neutral-600 text-sm">In Preparation</p>
          <p class="text-3xl font-bold text-blue-500 mt-2">0</p>
        </div>
        <div class="card border-l-4 border-green-500">
          <p class="text-neutral-600 text-sm">Ready for Pickup</p>
          <p class="text-3xl font-bold text-green-500 mt-2">0</p>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-4">Orders Queue</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Order cards will be displayed here -->
          <div class="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center">
            <p class="text-neutral-600">No pending orders</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KitchenComponent {}
