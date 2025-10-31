import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '@core/services/navigation.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
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
