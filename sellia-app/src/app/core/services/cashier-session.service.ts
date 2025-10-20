import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CashierSession {
  publicId: string;
  globalSessionPublicId: string;
  cashier: { publicId: string; name: string; cashierNumber: string };
  user: { publicId: string; firstName: string; lastName: string; username: string };
  status: 'OPEN' | 'LOCKED' | 'CLOSED';
  openedAt: string;
  lockedAt?: string;
  unlockedAt?: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount?: number;
  totalSales: number;
  lastActivityAt: string;
  inactivityLockMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class CashierSessionService {
  private apiUrl = `${environment.apiUrl}/cashier-sessions`;
  private currentSessionSubject = new BehaviorSubject<CashierSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();
  private sessionStatusSubject = new BehaviorSubject<'OPEN' | 'LOCKED' | 'CLOSED' | 'NONE'>('NONE');
  public sessionStatus$ = this.sessionStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentSession();
    this.startActivityTracking();
  }

  loadCurrentSession(): void {
    this.getCurrentSession().subscribe(
      (session) => {
        this.currentSessionSubject.next(session);
        this.sessionStatusSubject.next(session.status);
      },
      () => {
        this.currentSessionSubject.next(null);
        this.sessionStatusSubject.next('NONE');
      }
    );
  }

  getCurrentSession(): Observable<CashierSession> {
    return this.http.get<CashierSession>(`${this.apiUrl}/current`);
  }

  openSession(cashierId: string, pin: string, initialAmount: number = 0): Observable<CashierSession> {
    return this.http.post<CashierSession>(`${this.apiUrl}/open`, {
      cashierId,
      pin,
      initialAmount
    }).pipe(
      tap((session) => {
        this.currentSessionSubject.next(session);
        this.sessionStatusSubject.next('OPEN');
        this.updateActivityTimer();
      })
    );
  }

  lockSession(sessionId: string): Observable<CashierSession> {
    return this.http.post<CashierSession>(`${this.apiUrl}/${sessionId}/lock`, {}).pipe(
      tap((session) => {
        this.currentSessionSubject.next(session);
        this.sessionStatusSubject.next('LOCKED');
      })
    );
  }

  unlockSession(sessionId: string, pin: string): Observable<CashierSession> {
    return this.http.post<CashierSession>(`${this.apiUrl}/${sessionId}/unlock`, { pin }).pipe(
      tap((session) => {
        this.currentSessionSubject.next(session);
        this.sessionStatusSubject.next('OPEN');
        this.updateActivityTimer();
      })
    );
  }

  closeSession(sessionId: string, finalAmount: number = 0, notes?: string): Observable<CashierSession> {
    return this.http.post<CashierSession>(`${this.apiUrl}/${sessionId}/close`, {
      finalAmount,
      notes
    }).pipe(
      tap((session) => {
        this.currentSessionSubject.next(null);
        this.sessionStatusSubject.next('CLOSED');
      })
    );
  }

  updateActivity(): Observable<void> {
    const currentSession = this.currentSessionSubject.value;
    if (currentSession) {
      return this.http.post<void>(`${this.apiUrl}/${currentSession.publicId}/activity`, {});
    }
    return new Observable((observer) => observer.complete());
  }

  private activityTimer: any;

  private startActivityTracking(): void {
    // Track user activity and update server periodically
    interval(30000).subscribe(() => {
      this.updateActivity().subscribe();
    });
  }

  private updateActivityTimer(): void {
    // User activity will be tracked periodically
  }

  isSessionActive(): Observable<boolean> {
    return this.sessionStatus$.pipe(
      map((status) => status === 'OPEN')
    );
  }
}
