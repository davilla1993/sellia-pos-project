import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Order } from '@shared/models/types';

@Component({
  selector: 'app-order-tracking-simple',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking-simple.component.html',
  styleUrl: './order-tracking-simple.component.css'
})
export class OrderTrackingSimpleComponent implements OnInit {
  order = signal<Order | null>(null);

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.apiService.getOrder(orderId).subscribe(order => this.order.set(order));
    }
  }

  getTotal(order: Order): string {
    return Math.round(order.totalAmount).toLocaleString('fr-FR') + ' FCFA';
  }
}
