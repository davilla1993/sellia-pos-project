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
  tablesPerPage = 20;

  // Session & Orders
  selectedSession = signal<any | null>(null);
  sessionOrders = signal<any[]>([]);
  isLoadingOrders = signal(false);

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
  }

  loadRestaurantInfo(): void {
    this.apiService.getRestaurant().subscribe({
      next: (response: any) => {
        const info = response.data || response;
        this.restaurantInfo.set({
          name: info.name || 'SELLIA Restaurant',
          address: info.address || '123 Rue de la Gastronomie, Douala',
          phoneNumber: info.phoneNumber || '+237 6 XX XX XX XX',
          logoUrl: info.logoUrl || '/assets/logo.jpg'
        });
      },
      error: (err) => {
        console.error('Erreur chargement infos restaurant:', err);
      }
    });
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
            error: () => {
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
    this.loadSession(table.publicId);
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
    return this.sessionOrders().reduce((sum, order) => {
      const orderTotal = order.totalAmount - (order.discountAmount || 0);
      return sum + orderTotal;
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
  }

  canProcessPayment(): boolean {
    return this.amountPaid() >= this.finalTotal() && this.sessionOrders().length > 0;
  }

  processPayment(): void {
    if (!this.canProcessPayment() || !this.selectedSession()) return;

    this.isProcessing.set(true);
    this.errorMessage.set('');

    const paymentMethod = 'ESPECES';

    // Use the checkout session endpoint which handles payment and returns invoice
    this.apiService.checkoutSession(this.selectedSession().publicId, paymentMethod).subscribe({
      next: (response: any) => {
        // Extract invoice number from the response
        if (response?.invoice?.invoiceNumber) {
          this.invoiceNumber.set(response.invoice.invoiceNumber);
        } else {
          this.invoiceNumber.set('N/A');
        }

        // Finalize the session
        this.apiService.finalizeSession(this.selectedSession().publicId).subscribe({
          next: () => {
            this.isProcessing.set(false);
            this.printReceipt();
            this.resetCheckout();
          },
          error: () => {
            this.errorMessage.set('Erreur lors de la finalisation');
            this.isProcessing.set(false);
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

  printReceipt(): void {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      const tableNumber = this.selectedSession()?.tableNumber || 'Takeaway';
      const restaurant = this.restaurantInfo();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 11px; width: 80mm; margin: 0; padding: 0; }
            .receipt { padding: 10mm; text-align: center; }
            .logo { margin-bottom: 8px; }
            .logo img { max-width: 60mm; height: auto; }
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
              <div style="font-size: 9px; color: #666;">Session: ${this.selectedSession()?.publicId?.substring(0, 8)}</div>
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


}

