import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-search-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-invoice.component.html',
  styleUrls: ['./search-invoice.component.css']
})
export class SearchInvoiceComponent implements OnInit {
  invoiceNumber = '';
  searchResults = signal<any[]>([]);
  groupedInvoices = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searched = signal(false);
  restaurantInfo = signal<any>({
    name: 'SELLIA Restaurant',
    address: '123 Rue de la Gastronomie, Douala',
    phoneNumber: '+237 6 XX XX XX XX',
    logoUrl: '/assets/logo.jpg'
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRestaurantInfo();
  }

  loadRestaurantInfo(): void {
    this.apiService.getRestaurant().subscribe({
      next: (response: any) => {
        const info = response.data || response;
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
      return `${window.location.origin}/assets/logo.jpg`;
    }
    if (logoUrl.startsWith('http')) {
      return logoUrl;
    }
    const filename = logoUrl.includes('/') ? logoUrl.split('/').pop() : logoUrl;
    const apiUrl = this.apiService['apiUrl'];
    if (apiUrl.startsWith('http')) {
      return `${apiUrl}/restaurant/logo/${filename}`;
    }
    return `${window.location.origin}${apiUrl}/restaurant/logo/${filename}`;
  }

  searchInvoice(): void {
    if (!this.invoiceNumber.trim()) {
      this.error.set('Veuillez entrer un numéro de facture');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.searched.set(true);

    // Ajouter le préfixe INV- si l'utilisateur ne l'a pas mis
    let searchNumber = this.invoiceNumber.trim();
    if (!searchNumber.toUpperCase().startsWith('INV-')) {
      searchNumber = 'INV-' + searchNumber;
    }

    this.apiService.searchOrdersByInvoice(searchNumber).subscribe({
      next: (orders) => {
        this.searchResults.set(orders);
        this.groupOrdersByInvoice(orders);
        this.loading.set(false);
        if (orders.length === 0) {
          this.error.set('Aucune commande trouvée pour cette facture');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Facture non trouvée');
        this.searchResults.set([]);
        this.groupedInvoices.set([]);
      }
    });
  }

  groupOrdersByInvoice(orders: any[]): void {
    const invoiceMap = new Map<string, any>();

    orders.forEach(order => {
      const invoiceNumber = order.invoice?.invoiceNumber || 'N/A';

      if (!invoiceMap.has(invoiceNumber)) {
        invoiceMap.set(invoiceNumber, {
          invoiceNumber: invoiceNumber,
          orders: [],
          totalAmount: 0,
          totalDiscount: 0,
          cashierNumber: order.cashierSession?.cashier?.cashierNumber || '',
          table: order.table,
          orderType: order.orderType,
          paidAt: order.paidAt,
          createdAt: order.createdAt
        });
      }

      const invoice = invoiceMap.get(invoiceNumber);
      invoice.orders.push(order);
      invoice.totalAmount += order.totalAmount || 0;
      invoice.totalDiscount += order.discountAmount || 0;
    });

    this.groupedInvoices.set(Array.from(invoiceMap.values()));
  }

  clearSearch(): void {
    this.invoiceNumber = '';
    this.searchResults.set([]);
    this.groupedInvoices.set([]);
    this.error.set(null);
    this.searched.set(false);
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '0 FCFA';
    const formatted = Math.round(value).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  formatDateTime(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'EN_ATTENTE': 'bg-yellow-500/20 text-yellow-400',
      'EN_PREPARATION': 'bg-blue-500/20 text-blue-400',
      'PRET': 'bg-green-500/20 text-green-400',
      'SERVI': 'bg-purple-500/20 text-purple-400',
      'ANNULE': 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_PREPARATION': 'En préparation',
      'PRET': 'Prêt',
      'SERVI': 'Servi',
      'ANNULE': 'Annulé'
    };
    return labels[status] || status;
  }

  getTotalAmount(): number {
    return this.searchResults().reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }

  getTotalDiscounts(): number {
    return this.searchResults().reduce((sum, order) => sum + (order.discountAmount || 0), 0);
  }

  printInvoice(invoice: any): void {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    const tableNumber = invoice.table?.name || invoice.table?.number || (invoice.orderType === 'TAKEAWAY' ? 'TAKEAWAY' : 'N/A');
    const cashierNumber = invoice.cashierNumber || '';
    const invoiceNumber = invoice.invoiceNumber || 'N/A';
    const discountAmount = invoice.totalDiscount || 0;
    const finalAmount = invoice.totalAmount - discountAmount;
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
          <div style="font-weight: bold; margin: 5px 0;">Facture N°: ${invoiceNumber.replace('INV-', '')}</div>
          <div>${this.formatDateTime(invoice.paidAt || invoice.createdAt)}</div>

          <div class="section">
            <div>Table: <strong>${tableNumber}</strong></div>
            ${cashierNumber ? `<div>Caisse: <strong>${cashierNumber}</strong></div>` : ''}
          </div>

          <div class="section">
            ${invoice.orders.map((order: any) => `
              <div><strong>#${order.orderNumber}</strong></div>
              ${order.items.map((item: any) => `
                <div class="line">
                  <span>${item.quantity}x ${item.product.name}</span>
                  <span>${this.formatCurrency(item.totalPrice)}</span>
                </div>
              `).join('')}
            `).join('')}
          </div>

          <div class="section">
            <div class="line">
              <span>Sous-total:</span>
              <span>${this.formatCurrency(invoice.totalAmount)}</span>
            </div>
            ${discountAmount > 0 ? `
              <div class="line">
                <span>Réduction:</span>
                <span>-${this.formatCurrency(discountAmount)}</span>
              </div>
            ` : ''}
            <div class="line total" style="padding-top: 5px; border-top: 1px dashed #000; margin-top: 5px;">
              <span>TOTAL:</span>
              <span>${this.formatCurrency(finalAmount)}</span>
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
