import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarSimpleComponent } from '../navbar-simple/navbar-simple.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-layout-simple',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarSimpleComponent],
  templateUrl: './layout-simple.component.html',
  styleUrls: ['./layout-simple.component.css']
})



export class LayoutSimpleComponent {
  constructor(public authService: AuthService) {}
}
