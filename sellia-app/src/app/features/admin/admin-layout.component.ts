import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AdminNavbarComponent } from './admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, AdminNavbarComponent],
  template: `
    <div class="flex h-screen bg-neutral-900">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-admin-navbar></app-admin-navbar>
        <main class="flex-1 overflow-auto">
          <div class="p-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {}
