import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-simple.component.html',
  styleUrls: ['./navbar-simple.component.css']
})


export class NavbarSimpleComponent {
  // Logout button removed from navbar
}
