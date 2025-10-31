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
  templateUrl: './caisse-tickets.component.html',
  styleUrls: ['./caisse-tickets.component.css']
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
