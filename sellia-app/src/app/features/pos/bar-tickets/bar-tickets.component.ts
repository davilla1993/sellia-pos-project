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
  templateUrl: './bar-tickets.component.html',
  styleUrls: ['./bar-tickets.component.css']
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
