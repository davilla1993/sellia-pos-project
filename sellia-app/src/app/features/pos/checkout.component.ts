import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../shared/services/currency.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full gap-6 px-8 pb-8 pr-96 bg-neutral-900 overflow-hidden">
      <!-- TOP: Table Selection - FULL WIDTH -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <div>
          <h2 class="text-2xl font-bold text-white mb-3">🪑 Sélectionner une Table</h2>
          <div class="flex gap-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span class="text-green-400 font-semibold">{{ activeTables() }} Actives</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <span class="text-red-400 font-semibold">{{ inactiveTables() }} Libres</span>
            </div>
            <div class="ml-auto text-neutral-400">
              {{ paginatedTables().length }} table{{ paginatedTables().length > 1 ? 's' : '' }} affichée{{ paginatedTables().length > 1 ? 's' : '' }}
            </div>
          </div>
        </div>
        
        <!-- Search -->
        <div class="relative">
          <input [(ngModel)]="searchTable" type="text" placeholder="🔍 Rechercher table..." 
            class="w-full input-field bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 py-3">
        </div>

        <!-- Tables Grid - FULL WIDTH HORIZONTAL -->
        <div class="flex-1 flex flex-col gap-4 overflow-hidden">
          <div *ngIf="isLoadingTables()" class="flex justify-center items-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>

          <div *ngIf="!isLoadingTables()" class="flex-1 overflow-hidden">
            <div class="grid gap-4" [ngStyle]="{'gridTemplateColumns': 'repeat(auto-fit, minmax(140px, 1fr))'}">
              <div *ngFor="let table of paginatedTables()"
                [class.ring-3]="selectedTableId() === table.publicId"
                [class.ring-primary]="selectedTableId() === table.publicId"
                [class.bg-green-900]="tablesWithSessions().has(table.publicId)"
                [class.bg-red-900]="!tablesWithSessions().has(table.publicId)"
                [class.border-green-600]="tablesWithSessions().has(table.publicId)"
                [class.border-red-600]="!tablesWithSessions().has(table.publicId)"
                class="p-4 bg-neutral-800 border-2 border-neutral-700 rounded-lg transition-all relative">
                <button (click)="selectTable(table)" class="w-full text-left">
                  <div class="flex items-center gap-2 mb-2">
                    <div [class.bg-green-500]="tablesWithSessions().has(table.publicId)" [class.bg-red-500]="!tablesWithSessions().has(table.publicId)" class="w-2 h-2 rounded-full"></div>
                    <p class="font-bold text-white text-lg">{{ table.number }}</p>
                    <span *ngIf="table.isVip" class="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold ml-auto">VIP</span>
                  </div>
                  <p class="text-sm text-neutral-400 mb-2">{{ table.name }}</p>
                  <p class="text-xs font-semibold" [class.text-green-400]="tablesWithSessions().has(table.publicId)" [class.text-red-400]="!tablesWithSessions().has(table.publicId)">
                    {{ tablesWithSessions().has(table.publicId) ? '✓ Actif' : '○ Libre' }}
                  </p>
                </button>
                <button 
                  (click)="downloadTableQrCode(table); $event.stopPropagation()"
                  class="absolute bottom-2 right-2 p-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold transition-colors"
                  title="Télécharger QR Code">
                  📥 QR
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="!isLoadingTables() && filteredTables().length > 0" class="flex justify-center items-center gap-3 pt-4 border-t border-neutral-700">
            <button (click)="previousTablePage()" [disabled]="currentTablePage() === 1" class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-neutral-300 rounded-lg font-semibold">
              ← Précédent
            </button>
            <div class="flex gap-2">
              <button *ngFor="let page of getTablePageNumbers()" 
                (click)="goToTablePage(page)"
                [class.bg-primary]="currentTablePage() === page"
                [class.bg-neutral-700]="currentTablePage() !== page"
                [class.text-white]="currentTablePage() === page"
                [class.text-neutral-300]="currentTablePage() !== page"
                class="w-10 h-10 rounded-lg font-bold transition-colors">
                {{ page }}
              </button>
            </div>
            <button (click)="nextTablePage()" [disabled]="currentTablePage() === totalTablePages()" class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-neutral-300 rounded-lg font-semibold">
              Suivant →
            </button>
            <span class="text-neutral-400 text-sm ml-4 font-semibold">{{ currentTablePage() }} / {{ totalTablePages() }}</span>
          </div>
        </div>
      </div>

      <!-- BOTTOM: Payment Section - SIDEBAR ON RIGHT (FIXED) -->
      <div class="flex gap-6 h-1/3 overflow-hidden">
        <!-- Session Info -->
        <div *ngIf="selectedSession()">
          <h2 class="text-2xl font-bold text-white">Encaissement</h2>
          <p class="text-neutral-400 text-sm">Table {{ selectedSession().tableNumber }} <span *ngIf="selectedSession().tableName"> - {{ selectedSession().tableName }}</span></p>
        </div>

        <!-- Orders Display -->
        <div *ngIf="selectedSession() && !isLoadingOrders()" class="flex-1 overflow-y-auto bg-neutral-800 rounded-lg border border-neutral-700 p-4 space-y-3 min-w-0">
          <div *ngIf="sessionOrders().length > 0">
            <p class="text-sm font-semibold text-neutral-300 mb-3 uppercase">Commandes ({{ sessionOrders().length }})</p>
            <div *ngFor="let order of sessionOrders()" class="bg-neutral-700 rounded p-3 space-y-2 mb-3">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-white">#{{ order.orderNumber }}</span>
                <span class="text-xs bg-neutral-600 px-2 py-1 rounded text-neutral-300">{{ order.status }}</span>
              </div>
              <div *ngFor="let item of order.items" class="flex justify-between text-sm text-neutral-300">
                <span>{{ item.quantity }}x {{ item.product.name }}</span>
                <span>{{ currencyService.formatPrice(item.totalPrice) }}</span>
              </div>
              <div class="border-t border-neutral-600 pt-2 flex justify-between text-sm font-semibold">
                <span class="text-neutral-400">Total:</span>
                <span class="text-primary">{{ currencyService.formatPrice(order.totalAmount) }}</span>
              </div>
            </div>
          </div>
          <div *ngIf="sessionOrders().length === 0" class="text-center text-neutral-400">
            Aucune commande pour cette session
          </div>
        </div>

        <!-- Loading Orders -->
        <div *ngIf="selectedSession() && isLoadingOrders()" class="flex-1 flex justify-center items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Payment Sidebar - FIXED -->
        <div *ngIf="selectedSession() && !isLoadingOrders()" class="fixed bottom-8 right-8 w-96 flex flex-col gap-4 bg-neutral-800 rounded-lg border border-neutral-700 p-4 space-y-4 shadow-2xl" style="max-height: calc(100vh - 120px); overflow-y: auto;">
          <!-- Totals -->
          <div class="space-y-2">
            <div class="flex justify-between text-neutral-300">
              <span>Sous-total:</span>
              <span>{{ currencyService.formatPrice(sessionTotal()) }}</span>
            </div>
            <div *ngIf="discountAmount() > 0" class="flex justify-between text-neutral-300">
              <span>Réduction:</span>
              <span class="text-yellow-400">-{{ currencyService.formatPrice(discountAmount()) }}</span>
            </div>
            <div class="border-t border-neutral-600 pt-2 flex justify-between items-center">
              <span class="text-lg font-bold text-white">Total:</span>
              <span class="text-3xl font-bold text-primary">{{ currencyService.formatPrice(finalTotal()) }}</span>
            </div>
          </div>

          <!-- Cash Payment -->
          <div class="space-y-2 bg-neutral-700 rounded p-3">
            <label class="text-sm font-semibold text-neutral-300">Montant remis (FCFA)</label>
            <input [(ngModel)]="amountPaidInput" (ngModelChange)="updateAmountPaid($event)" 
              type="text" inputmode="numeric" class="w-full input-field bg-neutral-600 border-neutral-500 text-white text-sm" placeholder="0">
            <div class="space-y-2 pt-2 border-t border-neutral-600">
              <div class="flex justify-between text-neutral-300">
                <span>Rendu:</span>
                <span [class]="amountPaid() >= finalTotal() ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                  {{ currencyService.formatPrice(changeAmount()) }}
                </span>
              </div>
              <p *ngIf="amountPaid() < finalTotal()" class="text-xs text-red-400">
                Montant insuffisant: manque {{ currencyService.formatPrice(finalTotal() - amountPaid()) }}
              </p>
            </div>
          </div>

          <!-- Discount Input -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-neutral-300">Réduction (FCFA)</label>
            <input [(ngModel)]="discountPercent" (ngModelChange)="applyDiscount()" 
              type="number" min="0" class="w-full input-field bg-neutral-700 border-neutral-600 text-white text-sm" placeholder="0">
          </div>

          <!-- Payment Button -->
          <button (click)="processPayment()" 
            [disabled]="!canProcessPayment() || isProcessing()"
            class="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded transition-colors">
            {{ isProcessing() ? '⏳ Traitement...' : getButtonLabel() }}
          </button>

          <!-- Error Message -->
          <div *ngIf="errorMessage()" class="bg-red-500/10 border border-red-500 text-red-400 rounded p-3 text-sm">
            {{ errorMessage() }}
          </div>
        </div>
      </div>

      <!-- Receipt Template (Hidden) -->
      <div #receiptTemplate style="display: none;">
        <div id="receipt" class="w-80 bg-white p-4 text-black text-xs font-mono">
          <div class="text-center mb-4">
            <img *ngIf="restaurantInfo().logoUrl" [src]="restaurantInfo().logoUrl" alt="Logo" class="mx-auto w-20 mb-2">
            <p class="font-bold">{{ restaurantInfo().name }}</p>
            <p class="text-xs text-gray-600 mb-1">{{ restaurantInfo().address }}</p>
            <p class="text-xs text-gray-600 mb-2">{{ restaurantInfo().phoneNumber }}</p>
            <p class="font-bold text-lg">FACTURE</p>
            <p class="text-xs font-bold">N° {{ invoiceNumber() }}</p>
            <p class="text-xs">{{ receiptDate() }}</p>
          </div>
          
          <div class="border-b border-black mb-4 pb-4">
            <p class="font-bold">Table: {{ selectedSession()?.tableNumber || 'Takeaway' }}</p>
            <p class="text-xs">Session: {{ selectedSession()?.publicId?.substring(0, 8) }}</p>
          </div>

          <div class="border-b border-black mb-4 pb-4">
            <div *ngFor="let order of sessionOrders()" class="mb-2">
              <p class="font-bold">#{{ order.orderNumber }}</p>
              <div *ngFor="let item of order.items" class="flex justify-between">
                <span>{{ item.quantity }}x {{ item.product.name }}</span>
                <span>{{ currencyService.formatPrice(item.totalPrice) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-1 mb-4">
            <div class="flex justify-between">
              <span>Sous-total:</span>
              <span>{{ currencyService.formatPrice(sessionTotal()) }}</span>
            </div>
            <div *ngIf="discountAmount() > 0" class="flex justify-between">
              <span>Réduction:</span>
              <span>-{{ currencyService.formatPrice(discountAmount()) }}</span>
            </div>
            <div class="border-t border-black pt-1 flex justify-between font-bold text-base">
              <span>TOTAL:</span>
              <span>{{ currencyService.formatPrice(finalTotal()) }}</span>
            </div>
          </div>

          <div class="space-y-1 text-center border-t border-black pt-2">
            <p>Montant remis: {{ currencyService.formatPrice(amountPaid()) }}</p>
            <p>Rendu: {{ currencyService.formatPrice(changeAmount()) }}</p>
          </div>

          <div class="text-center mt-4 border-t border-black pt-2">
            <p class="text-xs">Merci!</p>
            <p class="text-xs">Revenezu bientôt</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep #receipt {
      width: 80mm;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      line-height: 1.4;
    }
  `]
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
  discountPercent = signal(0);
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
    const subtotal = this.sessionTotal();
    this.discountAmount.set(Math.round(subtotal * this.discountPercent() / 100));
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

