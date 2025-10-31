import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDark;
  showReports = signal(false);

  currentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Admin';
  }

  currentUserRole(): string {
    const user = this.authService.getCurrentUser();
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'CAISSE': 'Caissier',
      'CUISINE': 'Cuisinier'
    };
    return user ? roleMap[user.role] || user.role : 'Utilisateur';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleReportsMenu(): void {
    this.showReports.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
