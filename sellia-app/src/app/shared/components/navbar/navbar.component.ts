import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RestaurantInfoService } from '@shared/services/restaurant-info.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  restaurantService = inject(RestaurantInfoService);

  ngOnInit(): void {
    this.restaurantService.loadRestaurantInfo();
  }

  isAdmin(user: any): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  logout(): void {
    this.authService.logout();
  }
}
