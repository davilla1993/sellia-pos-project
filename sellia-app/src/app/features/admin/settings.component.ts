import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationSettingsComponent } from './settings/notification/notification-settings.component';
import { PaymentSettingsComponent } from './settings/payment/payment-settings.component';
import { RestaurantSettingsComponent } from './settings/restaurant/restaurant-settings.component';
import { SecuritySettingsComponent } from './settings/security/security-settings.component';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RestaurantSettingsComponent,
    PaymentSettingsComponent,
    NotificationSettingsComponent,
    SecuritySettingsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  showRestaurant = signal(false);
  showPayment = signal(false);
  showNotification = signal(false);
  showSecurity = signal(false);
}
