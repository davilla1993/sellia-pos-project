import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, MenuItem, Order, CustomerSession, Invoice, DailySalesReport } from '@shared/models/types';

const BACKEND_URL = environment.apiUrl.replace('/api', '');

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<Product[]> {
    return this.getAllProductsAdmin(0, 500).pipe(
      map(data => {
        const products = Array.isArray(data) ? data : (data && data.content) ? data.content : [];
        return this.fixProductImages(products as Product[]);
      })
    );
  }

  searchProducts(name: string): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/products/search`, {
      params: { name }
    }).pipe(
      map(response => this.extractArray(response)),
      map(products => this.fixProductImages(products as Product[]))
    );
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/products/category/${categoryId}`).pipe(
      map(response => this.extractArray(response)),
      map(products => this.fixProductImages(products as Product[]))
    );
  }

  // Menu Items
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<any>(`${this.apiUrl}/menu-items`).pipe(
      map(response => this.extractArray(response)),
      map(items => this.fixMenuItemImages(items as MenuItem[]))
    );
  }

  private fixMenuItemImages(items: MenuItem[]): MenuItem[] {
    return items.map(item => ({
      ...item,
      imageUrl: item.imageUrl ? this.fixImageUrl(item.imageUrl) : undefined
    }));
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response?.content && Array.isArray(response.content)) {
      return response.content;
    }
    if (response?.items && Array.isArray(response.items)) {
      return response.items;
    }
    if (response?.products && Array.isArray(response.products)) {
      return response.products;
    }
    return Array.isArray(response) ? response : [];
  }

  private fixProductImages(products: Product[]): Product[] {
    return products.map(product => ({
      ...product,
      imageUrl: product.imageUrl ? this.fixImageUrl(product.imageUrl) : undefined
    }));
  }

  private fixImageUrl(imageUrl: string): string {
    if (!imageUrl) return imageUrl;
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Extract filename from path
    const filename = imageUrl.includes('/') ? imageUrl.split('/').pop() : imageUrl;
    
    // Check if it's a menu or product image based on the path
    if (imageUrl.includes('/menus/')) {
      return `${this.apiUrl}/menus/images/${filename}`;
    }
    // Default to products
    return `${this.apiUrl}/products/images/${filename}`;
  }

  getImageAsDataUrl(imagePath: string): Observable<string> {
    const fullUrl = this.fixImageUrl(imagePath);
    return this.http.get(fullUrl, { responseType: 'blob' }).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        return url;
      })
    );
  }

  // Customer Sessions
  getOrCreateSession(tableId: string, customerName?: string, customerPhone?: string): Observable<CustomerSession> {
    const params = new HttpParams()
      .set('tableId', tableId)
      .set('customerName', customerName || '')
      .set('customerPhone', customerPhone || '');
    
    return this.http.post<CustomerSession>(`${this.apiUrl}/customer-sessions/start`, {}, { params });
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
    return this.http.get<any>(`${this.apiUrl}/stock`).pipe(
      map(response => this.extractArray(response))
    );
  }

  getLowStocks(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/stock/low-stock/list`).pipe(
      map(response => this.extractArray(response))
    );
  }

  getBelowMinimumStocks(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/stock/below-minimum/list`).pipe(
      map(response => this.extractArray(response))
    );
  }

  adjustStock(stockId: string, quantityChange: number, reason: string): Observable<any> {
    const params = new HttpParams()
      .set('quantityChange', quantityChange.toString())
      .set('reason', reason);
    
    return this.http.put<any>(`${this.apiUrl}/stock/${stockId}/adjust`, {}, { params });
  }

  // Users
  getUsers(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/users`, { params }).pipe(
      map(response => this.extractArray(response))
    );
  }

  getAllUsers(page: number = 0, size: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/users`, { params });
  }

  getUsersByRole(role: string, page: number = 0, size: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('role', role)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/users`, { params });
  }

  getUserById(publicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${publicId}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user);
  }

  updateUser(publicId: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${publicId}`, user);
  }

  deactivateUser(publicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${publicId}/deactivate`, {});
  }

  activateUser(publicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${publicId}/activate`, {});
  }

  resetPassword(publicId: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${publicId}/reset-password`, { newPassword, confirmPassword });
  }

  // Products (Management)
  getAllProductsAdmin(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/products`, { params }).pipe(
      map(response => this.extractArray(response)),
      map(products => this.fixProductImages(products as any[]))
    );
  }

  getProductByIdAdmin(publicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${publicId}`).pipe(
      map(product => ({
        ...product,
        imageUrl: product.imageUrl ? this.fixImageUrl(product.imageUrl) : undefined
      }))
    );
  }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products`, formData);
  }

  updateProduct(publicId: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${publicId}`, formData);
  }

  deleteProduct(publicId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products/${publicId}`);
  }

  toggleProductAvailability(publicId: string, available: boolean): Observable<any> {
    const endpoint = available ? 'activate' : 'deactivate';
    return this.http.post<any>(`${this.apiUrl}/products/${publicId}/${endpoint}`, {});
  }

  getWorkStations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/work-stations/all`);
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/categories/active/list`);
  }

  getAllCategories(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/categories`, { params }).pipe(
      map(response => this.extractArray(response))
    );
  }

  createCategory(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, request);
  }

  updateCategory(publicId: string, request: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${publicId}`, request);
  }

  deleteCategory(publicId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${publicId}`);
  }

  activateCategory(publicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories/${publicId}/activate`, {});
  }

  deactivateCategory(publicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories/${publicId}/deactivate`, {});
  }

  // Orders
  createOrder(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, request);
  }

  getOrder(publicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/${publicId}`);
  }

  getOrdersByStatus(status: string, page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/status/${status}`, {
      params: { page, size }
    });
  }

  updateOrderStatus(publicId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${publicId}/status/${status}`, {});
  }

  markOrderAsPaid(publicId: string, paymentMethod: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${publicId}/payment`, {}, {
      params: { paymentMethod }
    });
  }

  addDiscountToOrder(publicId: string, discountAmount: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${publicId}/discount`, {}, {
      params: { discountAmount }
    });
  }

  getUnpaidPendingOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/orders/pending/unpaid`).pipe(
      map(response => this.extractArray(response))
    );
  }

  // Customer Sessions
  createCustomerSession(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/customer-sessions`, request);
  }

  getActiveSessionByTable(tablePublicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customer-sessions/table/${tablePublicId}/active`);
  }

  getSessionOrders(sessionPublicId: string, page: number = 0, size: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customer-sessions/${sessionPublicId}/orders`, {
      params: { page, size }
    });
  }

  finalizeSession(sessionPublicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/customer-sessions/${sessionPublicId}/finalize`, {});
  }

  checkoutSession(sessionPublicId: string, paymentMethod: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders/session/${sessionPublicId}/checkout`, {}, {
      params: { paymentMethod }
    });
  }

  // Tables
  getTables(page: number = 0, size: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/tables`, { params });
  }

  getAvailableTables(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/tables/available/list`).pipe(
      map(response => this.extractArray(response))
    );
  }

  createTable(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tables`, data);
  }

  updateTable(publicId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tables/${publicId}`, data);
  }

  deleteTable(publicId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tables/${publicId}`);
  }

  generateTableQrCode(tablePublicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tables/${tablePublicId}/qrcode/generate`, {});
  }

  generateBulkTableQrCodes(tablePublicIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tables/qrcode/generate-bulk`, { tablePublicIds });
  }

  downloadFile(filePath: string): Observable<Blob> {
    const fullUrl = BACKEND_URL + filePath;
    return this.http.get(fullUrl, { responseType: 'blob' });
  }

  // Cashiers
  getMyCashiers(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/cashiers/my-cashiers`).pipe(
      map(response => {
        if (response?.content && Array.isArray(response.content)) {
          return response.content;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getAllCashiers(): Observable<any[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100');
    return this.http.get<any>(`${this.apiUrl}/cashiers`, { params }).pipe(
      map(response => {
        if (response?.content && Array.isArray(response.content)) {
          return response.content;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  createCashier(cashierData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashiers`, cashierData);
  }

  changeCashierPin(cashierId: string, newPin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashiers/${cashierId}/change-pin`, { pin: newPin });
  }

  assignUserToCashier(cashierId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashiers/${cashierId}/assign-user/${userId}`, {});
  }

  removeUserFromCashier(cashierId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cashiers/${cashierId}/remove-user/${userId}`);
  }

  getAssignedUserCashiers(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cashiers/user/${userId}/assigned-cashiers`);
  }

  // Global Sessions
  getCurrentGlobalSession(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/global-sessions/current`);
  }

  openGlobalSession(initialAmount: number = 0): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/global-sessions/open`, { initialAmount });
  }

  closeGlobalSession(sessionId: string, finalAmount: number, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/global-sessions/${sessionId}/close`, {
      finalAmount,
      reconciliationNotes: notes
    });
  }

  // Cashier Sessions
  getCurrentCashierSession(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cashier-sessions/current`);
  }

  openCashierSession(cashierId: string, pin: string, initialAmount: number = 0): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashier-sessions/open`, {
      cashierId,
      pin,
      initialAmount
    });
  }

  lockCashierSession(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashier-sessions/${sessionId}/lock`, {});
  }

  unlockCashierSession(sessionId: string, pin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashier-sessions/${sessionId}/unlock`, { pin });
  }

  closeCashierSession(sessionId: string, finalAmount: number = 0, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashier-sessions/${sessionId}/close`, {
      finalAmount,
      notes
    });
  }

  updateCashierSessionActivity(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cashier-sessions/${sessionId}/activity`, {});
  }

  // Reports
  getGlobalSessionReport(globalSessionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/global-session/${globalSessionId}`);
  }

  getCashierReport(cashierId: string, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/cashier/${cashierId}`, {
      params: { startDate, endDate }
    });
  }

  getUserReport(userId: string, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/user/${userId}`, {
      params: { startDate, endDate }
    });
  }

  downloadGlobalSessionReportPdf(globalSessionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/global-session/${globalSessionId}/pdf`, {
      responseType: 'blob'
    });
  }

  downloadCashierReportPdf(cashierId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/cashier/${cashierId}/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  downloadUserReportPdf(userId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/user/${userId}/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  downloadPdfFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Tickets
  generateSeparatedTickets(sessionId: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/tickets/session/${sessionId}/generate/separated`, {});
  }

  generateUnifiedTicket(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tickets/session/${sessionId}/generate/unified`, {});
  }

  getUnifiedTicket(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tickets/session/${sessionId}/unified`);
  }

  getSessionTicketsStatus(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tickets/session/${sessionId}/status`);
  }

  getBarTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tickets/station/BAR/active`);
  }

  getKitchenTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tickets/station/KITCHEN/active`);
  }

  markTicketAsReady(ticketId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tickets/${ticketId}/ready`, {});
  }

  markTicketAsServed(ticketId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tickets/${ticketId}/served`, {});
  }

  markTicketAsPrinted(ticketId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tickets/${ticketId}/print`, {});
  }

  // Menus
  getAllMenus(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/menus`, { params }).pipe(
      map(response => this.extractArray(response))
    );
  }

  getMenuById(publicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/menus/${publicId}`);
  }

  getActiveMenus(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/menus/active/list`).pipe(
      map(response => this.extractArray(response))
    );
  }

  createMenu(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/menus`, formData);
  }

  updateMenu(publicId: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/menus/${publicId}`, formData);
  }

  deleteMenu(publicId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/menus/${publicId}`);
  }

  activateMenu(publicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/menus/${publicId}/activate`, {});
  }

  deactivateMenu(publicId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/menus/${publicId}/deactivate`, {});
  }

  getMenuTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/menus/types/all`);
  }

  // Menu Items
  getAvailableMenuItems(page: number = 0, size: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/menu-items/available`, { params }).pipe(
      map(response => this.extractArray(response))
    );
  }

  getMenuItemsByMenu(menuId: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/menu-items/menu/${menuId}`, { params }).pipe(
      map(response => this.extractArray(response))
    );
  }

  getMenuItemsOrdered(menuId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/menu-items/menu/${menuId}/ordered`).pipe(
      map(response => this.extractArray(response))
    );
  }

  createMenuItem(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/menu-items`, request);
  }

  updateMenuItem(publicId: string, request: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/menu-items/${publicId}`, request);
  }

  deleteMenuItem(publicId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/menu-items/${publicId}`);
  }

  // Active Sessions
  getActiveCashierSessions(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/cashier-sessions`, {
      params: { page: '0', size: '100' }
    }).pipe(
      map(response => this.extractArray(response))
    );
  }

  getAllCashierSessions(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/cashier-sessions`, { params });
  }

  // Active Orders
  getActiveOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/orders/status/EN_ATTENTE`, {
      params: { page: '0', size: '100' }
    }).pipe(
      map(response => this.extractArray(response))
    );
  }

  // Public/QR Code Endpoints (No authentication required)
  getPublicMenu(tablePublicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/menu`, {
      params: { table: tablePublicId }
    });
  }

  getPublicMenuByQrToken(qrCodeToken: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/menu/${qrCodeToken}`);
  }

  createPublicOrder(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/public/orders`, request);
  }

  getPublicMenuHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/health`);
  }

  // Restaurant Settings
  getRestaurant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/restaurant`);
  }

  updateRestaurant(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/restaurant`, data);
  }

  // Analytics
  getAnalyticsSummary(dateStart: string, dateEnd: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/summary`, {
      params: { dateStart, dateEnd }
    });
  }

  getActiveSessions(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/analytics/active-sessions`);
  }

  // Roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  // Mark first login complete
  markFirstLoginComplete(publicId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${publicId}/mark-first-login-complete`, {});
  }
}
