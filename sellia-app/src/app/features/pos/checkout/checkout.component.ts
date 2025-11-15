import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { CurrencyService } from '@shared/services/currency.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private apiService = inject(ApiService);
  public currencyService = inject(CurrencyService);

  // Restaurant Info
  restaurantInfo = signal<any>({
    name: 'SELLIA Restaurant',
    address: '123 Rue de la Gastronomie, Douala',
    phoneNumber: '+237 6 XX XX XX XX',
    logoUrl: '/assets/logo.jpg'
  });

  // Tables
  searchTable = signal('');
  tables = signal<any[]>([]);
  tablesWithSessions = signal<Set<string>>(new Set());
  selectedTableId = signal<string | null>(null);
  isLoadingTables = signal(false);
  activeTables = signal(0);
  inactiveTables = signal(0);
  currentTablePage = signal(1);
  tablesPerPage = 12;

  // Session & Orders
  selectedSession = signal<any | null>(null);
  sessionOrders = signal<any[]>([]);
  isLoadingOrders = signal(false);

  // Takeaway Orders
  takeawayOrders = signal<any[]>([]);
  isLoadingTakeaway = signal(false);
  selectedTakeawayOrder = signal<any | null>(null);
  currentTakeawayPage = signal(1);
  takeawayPerPage = 10;

  // Tabs
  activeTab = signal<'tables' | 'takeaway'>('tables');

  // Payment
  amountPaidInput = signal('');
  amountPaid = signal(0);
  changeAmount = signal(0);
  discountPercent = signal(0); // Contient le montant de réduction en FCFA (mal nommé historiquement)
  discountAmount = signal(0);
  isProcessing = signal(false);
  errorMessage = signal('');
  invoiceNumber = signal('N/A');

  ngOnInit(): void {
    this.loadRestaurantInfo();
    this.loadTables();
    this.loadTakeawayOrders();
  }

  loadRestaurantInfo(): void {
    this.apiService.getRestaurant().subscribe({
      next: (response: any) => {
        const info = response.data || response;
        // Build absolute URL for logo to work in print window
        const logoUrl = this.buildAbsoluteLogoUrl(info.logoUrl);

        this.restaurantInfo.set({
          name: info.name || 'SELLIA Restaurant',
          address: info.address || '123 Rue de la Gastronomie, Douala',
          phoneNumber: info.phoneNumber || '+237 6 XX XX XX XX',
          logoUrl: logoUrl
        });
      },
      error: (err) => {
        console.error('Erreur chargement infos restaurant:', err);
      }
    });
  }

  private buildAbsoluteLogoUrl(logoUrl: string | null | undefined): string {
    if (!logoUrl) {
      // Return absolute URL for default logo
      return `${window.location.origin}/assets/logo.jpg`;
    }

    // If already absolute, return as is
    if (logoUrl.startsWith('http')) {
      return logoUrl;
    }

    // Extract filename from path
    const filename = logoUrl.includes('/') ? logoUrl.split('/').pop() : logoUrl;

    // Build absolute URL using backend API URL
    const apiUrl = this.apiService['apiUrl'];

    // If apiUrl is already absolute (starts with http), use it directly
    if (apiUrl.startsWith('http')) {
      return `${apiUrl}/restaurant/logo/${filename}`;
    }

    // Otherwise, prepend origin
    return `${window.location.origin}${apiUrl}/restaurant/logo/${filename}`;
  }

  filteredTables() {
    const query = this.searchTable().toLowerCase();
    return this.tables().filter(t => 
      t.number.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query)
    );
  }

  loadTables(): void {
    this.isLoadingTables.set(true);
    this.apiService.getTables().subscribe({
      next: (response) => {
        const tables = response?.content || response?.data || response || [];
        const tablesArray = Array.isArray(tables) ? tables : [];
        this.tables.set(tablesArray);
        
        // Check which tables have active sessions
        const sessionsSet = new Set<string>();
        let completedChecks = 0;
        
        tablesArray.forEach((table: any) => {
          this.apiService.getActiveSessionByTable(table.publicId).subscribe({
            next: () => {
              sessionsSet.add(table.publicId);
              completedChecks++;
              if (completedChecks === tablesArray.length) {
                this.updateTableStats(sessionsSet, tablesArray);
              }
            },
            error: (err) => {
              // Silent fail - table has no active session
              completedChecks++;
              if (completedChecks === tablesArray.length) {
                this.updateTableStats(sessionsSet, tablesArray);
              }
            }
          });
        });
        
        if (tablesArray.length === 0) {
          this.isLoadingTables.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading tables:', err);
        this.isLoadingTables.set(false);
      }
    });
  }

  private updateTableStats(sessionsSet: Set<string>, tables: any[]): void {
    this.tablesWithSessions.set(sessionsSet);
    this.activeTables.set(sessionsSet.size);
    this.inactiveTables.set(tables.length - sessionsSet.size);
    this.isLoadingTables.set(false);
  }

  selectTable(table: any): void {
    this.selectedTableId.set(table.publicId);
    this.selectedTakeawayOrder.set(null); // Deselect takeaway if any
    this.loadSession(table.publicId);
  }

  loadTakeawayOrders(): void {
    this.isLoadingTakeaway.set(true);
    this.apiService.getUnpaidPendingOrders().subscribe({
      next: (orders) => {
        // Filter only TAKEAWAY orders
        const takeawayOrders = orders.filter((o: any) => o.orderType === 'TAKEAWAY');
        this.takeawayOrders.set(takeawayOrders);
        this.isLoadingTakeaway.set(false);
      },
      error: (err) => {
        console.error('Error loading takeaway orders:', err);
        this.isLoadingTakeaway.set(false);
      }
    });
  }

  selectTakeawayOrder(order: any): void {
    this.selectedTakeawayOrder.set(order);
    this.selectedTableId.set(null); // Deselect table if any
    this.selectedSession.set(null);
    this.sessionOrders.set([order]);
  }

  loadSession(tablePublicId: string): void {
    this.isLoadingOrders.set(true);
    this.errorMessage.set('');
    
    this.apiService.getActiveSessionByTable(tablePublicId).subscribe({
      next: (session) => {
        this.selectedSession.set(session);
        this.loadSessionOrders(session.publicId);
      },
      error: (err) => {
        this.errorMessage.set('Aucune session ouverte pour cette table');
        this.isLoadingOrders.set(false);
      }
    });
  }

  loadSessionOrders(sessionPublicId: string): void {
    this.apiService.getSessionOrders(sessionPublicId).subscribe({
      next: (response: any) => {
        const orders = response.content || response.data || response || [];
        this.sessionOrders.set(Array.isArray(orders) ? orders : []);
        this.isLoadingOrders.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des commandes');
        this.isLoadingOrders.set(false);
      }
    });
  }

  sessionTotal(): number {
    // totalAmount contient déjà le montant net après réduction
    return this.sessionOrders().reduce((sum, order) => {
      return sum + order.totalAmount;
    }, 0);
  }

  finalTotal(): number {
    return Math.max(0, this.sessionTotal() - this.discountAmount());
  }

  updateAmountPaid(amountStr: string): void {
    const amount = parseInt(amountStr, 10) || 0;
    this.amountPaid.set(amount);
    this.calculateChange();
  }

  calculateChange(): void {
    const change = this.amountPaid() - this.finalTotal();
    this.changeAmount.set(Math.max(0, change));
  }

  applyDiscount(): void {
    // discountPercent contient directement le montant en FCFA (pas un pourcentage)
    this.discountAmount.set(Math.round(this.discountPercent()));
    // Recalculer le rendu après application de la réduction
    this.calculateChange();
  }

  canProcessPayment(): boolean {
    return this.amountPaid() >= this.finalTotal() && this.sessionOrders().length > 0;
  }

  processPayment(): void {
    if (!this.canProcessPayment()) return;

    this.isProcessing.set(true);
    this.errorMessage.set('');

    const paymentMethod = 'ESPECES';

    // Handle TAKEAWAY orders differently (no session)
    if (this.selectedTakeawayOrder()) {
      this.processTakeawayPayment(paymentMethod);
    } else if (this.selectedSession()) {
      this.processSessionPayment(paymentMethod);
    }
  }

  private processSessionPayment(paymentMethod: string): void {
    const sessionId = this.selectedSession()!.publicId;

    // Use the checkout session endpoint which handles payment and returns invoice
    this.apiService.checkoutSession(sessionId, paymentMethod).subscribe({
      next: (response: any) => {
        // Extract invoice number from the response
        if (response?.invoice?.invoiceNumber) {
          this.invoiceNumber.set(response.invoice.invoiceNumber);
        } else {
          this.invoiceNumber.set('N/A');
        }

        // Get full invoice details including cashRegisterNumber
        this.apiService.getSessionInvoiceDetail(sessionId).subscribe({
          next: (invoice: any) => {
            // Store cashRegisterNumber in session for printReceipt
            const session = this.selectedSession();
            if (session) {
              session.cashRegisterNumber = invoice.cashRegisterNumber;
              this.selectedSession.set({...session});
            }

            // Finalize the session
            this.apiService.finalizeSession(sessionId).subscribe({
              next: () => {
                this.isProcessing.set(false);
                this.printReceipt();
                this.resetCheckout();
                this.loadTables();
              },
              error: () => {
                this.errorMessage.set('Erreur lors de la finalisation');
                this.isProcessing.set(false);
              }
            });
          },
          error: () => {
            // Continue even if invoice detail fails
            this.apiService.finalizeSession(sessionId).subscribe({
              next: () => {
                this.isProcessing.set(false);
                this.printReceipt();
                this.resetCheckout();
                this.loadTables();
              },
              error: () => {
                this.errorMessage.set('Erreur lors de la finalisation');
                this.isProcessing.set(false);
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Checkout error:', error);
        this.errorMessage.set('Erreur lors de l\'encaissement');
        this.isProcessing.set(false);
      }
    });
  }

  private processTakeawayPayment(paymentMethod: string): void {
    const order = this.selectedTakeawayOrder()!;

    // Mark order as paid
    this.apiService.markOrderAsPaid(order.publicId, paymentMethod).subscribe({
      next: (response: any) => {
        // Get invoice number if available
        if (response?.invoice?.invoiceNumber) {
          this.invoiceNumber.set(response.invoice.invoiceNumber);
        } else {
          this.invoiceNumber.set('N/A');
        }

        // Get cashRegisterNumber from payment response
        if (response?.cashierSession?.cashier?.cashierNumber) {
          order.cashRegisterNumber = response.cashierSession.cashier.cashierNumber;
          this.selectedTakeawayOrder.set({...order});
        }

        this.isProcessing.set(false);
        this.printReceipt();
        this.resetCheckout();
        this.loadTakeawayOrders();
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.errorMessage.set('Erreur lors de l\'encaissement');
        this.isProcessing.set(false);
      }
    });
  }

  printReceipt(): void {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      let tableNumber = 'TAKEAWAY';
      let cashierNumber = '';

      if (this.selectedSession()?.tableNumber) {
        tableNumber = this.selectedSession().tableNumber;
        // Get cashier number from session (set during payment)
        cashierNumber = this.selectedSession()?.cashRegisterNumber || '';
      } else if (this.selectedTakeawayOrder()) {
        // Use customer name if available
        const order = this.selectedTakeawayOrder();
        tableNumber = order.customerName || 'TAKEAWAY';
        // Get cashier number from takeaway order (set during payment)
        cashierNumber = order?.cashRegisterNumber || '';
      }
      const restaurant = this.restaurantInfo();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 11px; width: 80mm; margin: 0; padding: 0; }
            .receipt { padding: 10mm; text-align: center; }
            .logo { margin-bottom: 8px; }
            .logo img { max-width: 40mm; height: auto; }
            .restaurant-info { font-weight: bold; margin-bottom: 5px; }
            .restaurant-details { font-size: 9px; color: #333; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
            .header { font-weight: bold; font-size: 14px; margin-bottom: 10px; }
            .section { border-bottom: 1px dashed #000; margin: 10px 0; padding: 10px 0; text-align: left; }
            .line { display: flex; justify-content: space-between; }
            .total { font-weight: bold; font-size: 12px; }
            .footer { text-align: center; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="logo">
              <img src="${restaurant.logoUrl}" alt="Logo">
            </div>
            
            <div class="restaurant-info">${restaurant.name}</div>
            <div class="restaurant-details">
              ${restaurant.address}<br>
              Tél: ${restaurant.phoneNumber}
            </div>
            
            <div class="header">TICKET DE CAISSE</div>
            <div style="font-weight: bold; margin: 5px 0;">Facture N°: ${this.invoiceNumber().replace('INV-', '')}</div>
            <div>${this.receiptDate()}</div>

            <div class="section">
              <div>Table: <strong>${tableNumber}</strong></div>
              ${cashierNumber ? `<div>Caisse: <strong>${cashierNumber}</strong></div>` : ''}
              ${this.selectedSession() ? `<div style="font-size: 9px; color: #666;">Session: ${this.selectedSession()?.publicId?.substring(0, 8)}</div>` : ''}
            </div>

            <div class="section">
              ${this.sessionOrders().map(order => `
                <div><strong>#${order.orderNumber}</strong></div>
                ${order.items.map((item: any) => `
                  <div class="line">
                    <span>${item.quantity}x ${item.product.name}</span>
                    <span>${this.currencyService.formatPrice(item.totalPrice)}</span>
                  </div>
                `).join('')}
              `).join('')}
            </div>

            <div class="section">
              <div class="line">
                <span>Sous-total:</span>
                <span>${this.currencyService.formatPrice(this.sessionTotal())}</span>
              </div>
              ${this.discountAmount() > 0 ? `
                <div class="line">
                  <span>Réduction:</span>
                  <span>-${this.currencyService.formatPrice(this.discountAmount())}</span>
                </div>
              ` : ''}
              <div class="line total" style="padding-top: 5px; border-top: 1px dashed #000; margin-top: 5px;">
                <span>TOTAL:</span>
                <span>${this.currencyService.formatPrice(this.finalTotal())}</span>
              </div>
            </div>

            <div class="section">
              <div class="line">
                <span>Montant remis:</span>
                <span>${this.currencyService.formatPrice(this.amountPaid())}</span>
              </div>
              <div class="line">
                <span>Rendu:</span>
                <span>${this.currencyService.formatPrice(this.changeAmount())}</span>
              </div>
            </div>

            <div class="footer">
              <div style="margin-top: 10px; font-size: 10px;">Merci!</div>
              <div style="font-size: 9px; color: #666;">Revenez bientôt</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  receiptDate(): string {
    return new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  resetCheckout(): void {
    this.selectedTableId.set(null);
    this.selectedSession.set(null);
    this.selectedTakeawayOrder.set(null);
    this.sessionOrders.set([]);
    this.amountPaidInput.set('');
    this.amountPaid.set(0);
    this.changeAmount.set(0);
    this.discountPercent.set(0);
    this.discountAmount.set(0);
  }

  getButtonLabel(): string {
    return `💳 Encaisser et Imprimer Reçu - ${this.currencyService.formatPrice(this.finalTotal())}`;
  }

  // Table Pagination
  paginatedTables() {
    const start = (this.currentTablePage() - 1) * this.tablesPerPage;
    return this.filteredTables().slice(start, start + this.tablesPerPage);
  }

  totalTablePages() {
    return Math.ceil(this.filteredTables().length / this.tablesPerPage);
  }

  getTablePageNumbers(): number[] {
    const pages = [];
    const max = this.totalTablePages();
    for (let i = 1; i <= max && i <= 5; i++) {
      pages.push(i);
    }
    return pages;
  }

  previousTablePage(): void {
    if (this.currentTablePage() > 1) {
      this.currentTablePage.set(this.currentTablePage() - 1);
    }
  }

  nextTablePage(): void {
    if (this.currentTablePage() < this.totalTablePages()) {
      this.currentTablePage.set(this.currentTablePage() + 1);
    }
  }

  goToTablePage(page: number): void {
    this.currentTablePage.set(page);
  }

  downloadTableQrCode(table: any): void {
    this.apiService.generateTableQrCode(table.publicId).subscribe({
      next: (response) => {
        if (response.qrCodeUrl) {
          // Download the QR code image
          const link = document.createElement('a');
          link.href = response.qrCodeUrl;
          link.download = `table-${table.number}-qr-code.png`;
          link.click();
        }
      },
      error: (err) => {
        console.error('Error generating QR code:', err);
      }
    });
  }

  // Takeaway Pagination
  paginatedTakeawayOrders() {
    const start = (this.currentTakeawayPage() - 1) * this.takeawayPerPage;
    return this.takeawayOrders().slice(start, start + this.takeawayPerPage);
  }

  totalTakeawayPages() {
    return Math.ceil(this.takeawayOrders().length / this.takeawayPerPage);
  }

  getTakeawayPageNumbers(): number[] {
    const pages = [];
    const max = this.totalTakeawayPages();
    for (let i = 1; i <= max && i <= 5; i++) {
      pages.push(i);
    }
    return pages;
  }

  previousTakeawayPage(): void {
    if (this.currentTakeawayPage() > 1) {
      this.currentTakeawayPage.set(this.currentTakeawayPage() - 1);
    }
  }

  nextTakeawayPage(): void {
    if (this.currentTakeawayPage() < this.totalTakeawayPages()) {
      this.currentTakeawayPage.set(this.currentTakeawayPage() + 1);
    }
  }

  goToTakeawayPage(page: number): void {
    this.currentTakeawayPage.set(page);
  }

  // Tabs
  selectTab(tab: 'tables' | 'takeaway'): void {
    this.activeTab.set(tab);
  }
}

