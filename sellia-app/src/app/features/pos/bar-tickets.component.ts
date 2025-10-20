import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-bar-tickets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-tickets-container">
      <div class="header">
        <h1>🍹 BAR - Tickets</h1>
        <p class="subtitle">Commandes à préparer au bar</p>
      </div>

      <div *ngIf="barTickets.length === 0" class="no-tickets">
        <p>Aucun ticket en attente</p>
      </div>

      <div class="tickets-grid">
        <div *ngFor="let ticket of barTickets" class="ticket-card" [class.ready]="ticket.status === 'READY'">
          <div class="ticket-header">
            <h2>{{ ticket.ticketNumber }}</h2>
            <span class="status-badge" [class.status]="ticket.status">
              {{ ticket.status }}
            </span>
          </div>

          <div class="ticket-info">
            <p><strong>Table:</strong> {{ ticket.tableNumber }}</p>
            <p><strong>Client:</strong> {{ ticket.customerName }}</p>
            <p *ngIf="ticket.message" class="message">{{ ticket.message }}</p>
          </div>

          <div class="items-list">
            <h3>Items à préparer:</h3>
            <ul>
              <li *ngFor="let item of ticket.items">
                <strong>{{ item.quantity }}x</strong> {{ item.itemName }}
                <span *ngIf="item.notes" class="notes">{{ item.notes }}</span>
              </li>
            </ul>
          </div>

          <div class="actions">
            <button (click)="markReady(ticket)" class="btn btn-primary" [disabled]="ticket.status === 'READY'">
              ✓ Prêt
            </button>
            <button (click)="printTicket(ticket)" class="btn btn-secondary">
              🖨 Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bar-tickets-container { padding: 20px; background: #1a1a1a; min-height: 100vh; }
    .header { margin-bottom: 30px; }
    .header h1 { color: #fff; font-size: 2em; margin: 0; }
    .subtitle { color: #888; margin-top: 5px; }
    
    .no-tickets { text-align: center; padding: 40px; color: #888; font-size: 1.2em; }
    
    .tickets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    
    .ticket-card { 
      background: #2a2a2a; 
      border: 2px solid #444; 
      border-radius: 8px; 
      padding: 20px; 
      color: #e0e0e0;
      position: relative;
    }
    
    .ticket-card.ready { border-color: #10b981; background: #1a2e1f; }
    
    .ticket-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .ticket-header h2 { color: #fff; margin: 0; font-size: 1.3em; }
    
    .status-badge { 
      padding: 4px 12px; 
      border-radius: 20px; 
      font-size: 0.85em; 
      font-weight: bold;
      background: #ff6b6b;
      color: white;
    }
    
    .status-badge.status { background: #10b981; }
    
    .ticket-info { margin-bottom: 15px; font-size: 0.9em; }
    .ticket-info p { margin: 5px 0; }
    .message { color: #ffd93d; font-style: italic; }
    
    .items-list { background: #111; padding: 12px; border-radius: 4px; margin-bottom: 15px; }
    .items-list h3 { margin: 0 0 10px 0; color: #ffd93d; font-size: 0.95em; }
    .items-list ul { list-style: none; padding: 0; margin: 0; }
    .items-list li { padding: 6px 0; color: #ccc; }
    .notes { color: #888; font-size: 0.85em; }
    
    .actions { display: flex; gap: 10px; }
    .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-primary { background: #10b981; color: white; flex: 1; }
    .btn-primary:hover:not(:disabled) { background: #059669; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #666; color: white; }
    .btn-secondary:hover { background: #777; }
  `]
})
export class BarTicketsComponent implements OnInit, OnDestroy {
  barTickets: any[] = [];
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
        interval(3000).pipe(
          switchMap(() => this.apiService.getSessionTicketsStatus(sessionId))
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      if (response.ticketsByStation?.['BAR']) {
        this.barTickets = [response.ticketsByStation['BAR']];
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markReady(ticket: any) {
    this.apiService.markTicketAsReady(ticket.ticketPublicId).subscribe(() => {
      alert('Ticket marqué comme prêt');
    });
  }

  printTicket(ticket: any) {
    window.print();
  }
}
