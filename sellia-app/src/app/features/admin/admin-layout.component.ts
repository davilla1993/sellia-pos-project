import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AdminNavbarComponent } from './admin-navbar.component';
import { AdminSidebarService } from './admin-sidebar.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, AdminNavbarComponent],
  template: `
    <div class="h-screen bg-neutral-900">
      <app-sidebar></app-sidebar>
      <div class="ml-64 transition-all duration-300 flex flex-col h-screen" [class.ml-20]="sidebarService.collapsed()">
        <app-admin-navbar></app-admin-navbar>
        <main class="flex-1 overflow-auto bg-neutral-900">
          <div class="p-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
  sidebarService = inject(AdminSidebarService);
}
