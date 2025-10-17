import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, MenuItem, Order, CustomerSession, Invoice, DailySalesReport } from '@shared/models/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/available/list`);
  }

  searchProducts(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search`, {
      params: { name }
    });
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/category/${categoryId}`);
  }

  // Menu Items
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu-items`);
  }

  // Customer Sessions
  getOrCreateSession(tableId: string, customerName?: string, customerPhone?: string): Observable<CustomerSession> {
    const params = new HttpParams()
      .set('tableId', tableId)
      .set('customerName', customerName || '')
      .set('customerPhone', customerPhone || '');
    
    return this.http.post<CustomerSession>(`${this.apiUrl}/customer-sessions/start`, {}, { params });
  }

  getSessionOrders(sessionId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer-sessions/${sessionId}/orders`);
  }

  finalizeSession(sessionId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/customer-sessions/${sessionId}/finalize`, {});
  }

  // Orders
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  getOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderNumber}`);
  }

  updateOrder(orderId: string, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}`, order);
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/status/${status}`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }

  // Reports
  getDailySalesReport(startDate: string, endDate: string): Observable<DailySalesReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<DailySalesReport>(`${this.apiUrl}/reports/daily-sales`, { params });
  }

  getRevenueReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<any>(`${this.apiUrl}/reports/revenue`, { params });
  }

  getOrdersSummary(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<any>(`${this.apiUrl}/reports/orders-summary`, { params });
  }

  getInventorySummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/inventory-summary`);
  }

  // Stock
  getStocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock`);
  }

  getLowStocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock/low-stock/list`);
  }

  getBelowMinimumStocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock/below-minimum/list`);
  }

  adjustStock(stockId: string, quantityChange: number, reason: string): Observable<any> {
    const params = new HttpParams()
      .set('quantityChange', quantityChange.toString())
      .set('reason', reason);
    
    return this.http.put<any>(`${this.apiUrl}/stock/${stockId}/adjust`, {}, { params });
  }
}
