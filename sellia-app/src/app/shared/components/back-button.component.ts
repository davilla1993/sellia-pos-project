import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between mb-6 bg-neutral-800 rounded-lg p-4 border border-neutral-700">
      <h1 class="text-2xl lg:text-3xl font-bold text-white">{{ title }}</h1>
      <button 
        *ngIf="navigationService.isAdmin()"
        (click)="goToDashboard()"
        class="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-primary text-white rounded-lg transition-colors text-sm lg:text-base font-semibold">
        <span>📊</span>
        <span class="hidden sm:inline">Dashboard</span>
      </button>
    </div>
  `,
  styles: []
})
export class BackButtonComponent {
  @Input() title = 'Page';
  
  navigationService = inject(NavigationService);
  private router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
