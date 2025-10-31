import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AdminSidebarService } from '@core/services/admin-sidebar.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, AdminNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  sidebarService = inject(AdminSidebarService);
}
