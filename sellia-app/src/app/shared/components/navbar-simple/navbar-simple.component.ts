import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-simple.component.html',
  styleUrls: ['./navbar-simple.component.css']
})


export class NavbarSimpleComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
