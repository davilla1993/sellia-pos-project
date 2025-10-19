import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between bg-neutral-800 border-b border-neutral-700 px-6 py-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white">{{ title }}</h1>
        <p *ngIf="subtitle" class="text-sm text-neutral-400 mt-1">{{ subtitle }}</p>
      </div>
      
      <button 
        *ngIf="navigationService.isAdmin()"
        (click)="goToDashboard()"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm lg:text-base font-semibold">
        <span>📊</span>
        <span class="hidden sm:inline">Dashboard</span>
      </button>
    </div>
  `,
  styles: []
})
export class AdminHeaderComponent {
  @Input() title = 'Page';
  @Input() subtitle = '';

  navigationService = inject(NavigationService);
  private router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
