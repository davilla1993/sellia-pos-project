import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GlobalSession {
  publicId: string;
  status: 'OPEN' | 'CLOSED' | 'SUSPENDED';
  openedAt: string;
  closedAt?: string;
  openedBy: { publicId: string; firstName: string; lastName: string };
  closedBy?: { publicId: string; firstName: string; lastName: string };
  initialAmount: number;
  finalAmount?: number;
  totalSales: number;
  reconciliationNotes?: string;
  reconciliationAmount?: number;
}

export interface GlobalSessionSummary {
  globalSessionId: string;
  totalInitialAmount: number;
  totalSales: number;
  totalCashEntrees: number;
  totalCashSorties: number;
  expectedAmount: number;
  totalCashierSessions: number;
  openCashierSessions: number;
  closedCashierSessions: number;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSessionService {
  private apiUrl = `${environment.apiUrl}/global-sessions`;
  private currentSessionSubject = new BehaviorSubject<GlobalSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();
  private isSessionOpen$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadCurrentSession();
  }

  loadCurrentSession(): void {
    this.getCurrentSession().subscribe(
      (session) => {
        this.currentSessionSubject.next(session);
        this.isSessionOpen$.next(session.status === 'OPEN');
      },
      () => {
        this.currentSessionSubject.next(null);
        this.isSessionOpen$.next(false);
      }
    );
  }

  getCurrentSession(): Observable<GlobalSession> {
    return this.http.get<GlobalSession>(`${this.apiUrl}/current`);
  }

  openSession(): Observable<GlobalSession> {
    return this.http.post<GlobalSession>(`${this.apiUrl}/open`, {}).pipe(
      tap((session) => {
        this.currentSessionSubject.next(session);
        this.isSessionOpen$.next(true);
      })
    );
  }

  getSummary(publicId: string): Observable<GlobalSessionSummary> {
    return this.http.get<GlobalSessionSummary>(`${this.apiUrl}/${publicId}/summary`);
  }

  closeSession(publicId: string, finalAmount: number, notes: string): Observable<GlobalSession> {
    return this.http.post<GlobalSession>(`${this.apiUrl}/${publicId}/close`, {
      finalAmount,
      reconciliationNotes: notes
    }).pipe(
      tap((session) => {
        this.currentSessionSubject.next(null);
        this.isSessionOpen$.next(false);
      })
    );
  }

  isOpen(): Observable<boolean> {
    return this.isSessionOpen$;
  }
}
