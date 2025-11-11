import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantInfoService } from '@shared/services/restaurant-info.service';

@Component({
  selector: 'app-navbar-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-simple.component.html',
  styleUrls: ['./navbar-simple.component.css']
})
export class NavbarSimpleComponent implements OnInit {
  restaurantService = inject(RestaurantInfoService);

  ngOnInit(): void {
    this.restaurantService.loadRestaurantInfo();
  }
}
