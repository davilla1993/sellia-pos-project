import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuditorSidebarComponent } from '../auditor-sidebar/auditor-sidebar.component';

@Component({
  selector: 'app-auditor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AuditorSidebarComponent],
  template: `
    <div class="h-screen bg-neutral-900">
      <app-auditor-sidebar></app-auditor-sidebar>
      <div class="ml-56 transition-all duration-300 flex flex-col h-screen">
        <header class="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center px-6">
          <h1 class="text-xl font-semibold text-white">Audit & Monitoring</h1>
        </header>
        <main class="flex-1 overflow-auto bg-neutral-900">
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AuditorLayoutComponent {}
