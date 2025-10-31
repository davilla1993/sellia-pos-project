import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.css']
})
export class BackButtonComponent {
  @Input() title = 'Page';
  
  navigationService = inject(NavigationService);
  private router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
