import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-caisse-tickets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="caisse-container">
      <div class="header">
        <h1>💰 CAISSE - Reçu Complet</h1>
        <p class="subtitle">Aperçu de la commande complète</p>
      </div>

      <div *ngIf="!unifiedTicket" class="no-ticket">
        <p>Aucun reçu en attente</p>
      </div>

      <div *ngIf="unifiedTicket" class="receipt-container">
        <div class="receipt">
          <div class="receipt-header">
            <h2>REÇU #{{ unifiedTicket.ticketNumber }}</h2>
            <p>Table: {{ unifiedTicket.tableNumber }}</p>
            <p>Client: {{ unifiedTicket.customerName }}</p>
          </div>

          <!-- BAR SECTION -->
          <div *ngIf="unifiedTicket.itemsByStation?.['BAR']" class="section bar-section">
            <h3>🍹 BAR</h3>
            <div class="items">
              <div *ngFor="let item of unifiedTicket.itemsByStation['BAR']" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ item.itemName }}</span>
                <span *ngIf="item.notes" class="notes">{{ item.notes }}</span>
              </div>
            </div>
          </div>

          <!-- KITCHEN SECTION -->
          <div *ngIf="unifiedTicket.itemsByStation?.['KITCHEN']" class="section kitchen-section">
            <h3>👨‍🍳 CUISINE</h3>
            <div class="items">
              <div *ngFor="let item of unifiedTicket.itemsByStation['KITCHEN']" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ item.itemName }}</span>
                <span *ngIf="item.notes" class="notes">{{ item.notes }}</span>
              </div>
            </div>
          </div>

          <!-- PASTRY SECTION -->
          <div *ngIf="unifiedTicket.itemsByStation?.['PASTRY']" class="section pastry-section">
            <h3>🍰 PÂTISSERIE</h3>
            <div class="items">
              <div *ngFor="let item of unifiedTicket.itemsByStation['PASTRY']" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ item.itemName }}</span>
                <span *ngIf="item.notes" class="notes">{{ item.notes }}</span>
              </div>
            </div>
          </div>

          <div class="receipt-footer">
            <p>Total items: {{ unifiedTicket.totalItems }}</p>
            <p>Stations: {{ unifiedTicket.totalStations }}</p>
          </div>
        </div>

        <div class="status-bar" [class.ready]="unifiedTicket.status === 'READY'">
          <span class="status">Status: {{ unifiedTicket.status }}</span>
          <span class="time">{{ unifiedTicket.createdAt | date: 'HH:mm:ss' }}</span>
        </div>

        <div class="actions">
          <button (click)="printReceipt()" class="btn btn-print">
            🖨 Imprimer Reçu
          </button>
          <button (click)="markServed()" class="btn btn-served">
            ✓ Servir
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .caisse-container { padding: 20px; background: #1a1a1a; min-height: 100vh; }
    .header { margin-bottom: 30px; text-align: center; }
    .header h1 { color: #fff; font-size: 2em; margin: 0; }
    .subtitle { color: #888; margin-top: 5px; }

    .no-ticket { text-align: center; padding: 60px 20px; color: #888; font-size: 1.3em; }

    .receipt-container { max-width: 600px; margin: 0 auto; }

    .receipt {
      background: #fff;
      color: #000;
      padding: 30px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }

    .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
    .receipt-header h2 { margin: 0 0 5px 0; font-size: 1.3em; }
    .receipt-header p { margin: 3px 0; font-size: 0.9em; }

    .section { margin: 20px 0; padding: 15px 0; border-bottom: 1px dashed #999; }
    .section h3 { margin: 0 0 10px 0; font-size: 1.1em; text-transform: uppercase; }

    .section.bar-section h3 { color: #e74c3c; }
    .section.kitchen-section h3 { color: #f39c12; }
    .section.pastry-section h3 { color: #9b59b6; }

    .items { }
    .item { display: flex; padding: 5px 0; font-size: 0.95em; }
    .qty { width: 40px; font-weight: bold; }
    .name { flex: 1; padding-left: 10px; }
    .notes { font-size: 0.8em; color: #666; margin-left: 10px; font-style: italic; }

    .receipt-footer { text-align: center; margin-top: 15px; padding-top: 15px; border-top: 2px solid #000; font-size: 0.9em; }
    .receipt-footer p { margin: 5px 0; }

    .status-bar { background: #ff6b6b; color: white; padding: 12px; border-radius: 4px; margin-bottom: 15px; display: flex; justify-content: space-between; font-weight: bold; }
    .status-bar.ready { background: #10b981; }

    .actions { display: flex; gap: 15px; }
    .btn { padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1em; }
    .btn-print { background: #3498db; color: white; flex: 1; }
    .btn-print:hover { background: #2980b9; }
    .btn-served { background: #10b981; color: white; flex: 1; }
    .btn-served:hover { background: #059669; }

    @media print {
      .header, .status-bar, .actions { display: none; }
      .receipt { box-shadow: none; }
    }
  `]
})
export class CaisseTicketsComponent implements OnInit, OnDestroy {
  unifiedTicket: any = null;
  private destroy$ = new Subject<void>();
  private sessionId$ = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        if (params['sessionId']) {
          this.sessionId$.next(params['sessionId']);
        }
        return this.sessionId$;
      }),
      switchMap(sessionId => 
        interval(2000).pipe(
          switchMap(() => this.apiService.getUnifiedTicket(sessionId))
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe(ticket => {
      this.unifiedTicket = ticket;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  printReceipt() {
    window.print();
  }

  markServed() {
    if (this.unifiedTicket) {
      this.apiService.markTicketAsServed(this.unifiedTicket.ticketPublicId).subscribe(() => {
        alert('Commande marquée comme servie');
        this.unifiedTicket = null;
      });
    }
  }
}
