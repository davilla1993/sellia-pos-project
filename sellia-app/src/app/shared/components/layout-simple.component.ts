import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarSimpleComponent } from './navbar-simple.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout-simple',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarSimpleComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-primary-light">
      <app-navbar-simple></app-navbar-simple>
      <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <router-outlet></router-outlet>
      </main>
      <footer class="bg-dark text-white mt-12 py-8">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p class="text-neutral-400">© 2025 Maison Recla. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `
})
export class LayoutSimpleComponent {
  constructor(public authService: AuthService) {}
}
