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

  openSession(initialAmount: number = 0): Observable<GlobalSession> {
    return this.http.post<GlobalSession>(`${this.apiUrl}/open`, { initialAmount }).pipe(
      tap((session) => {
        this.currentSessionSubject.next(session);
        this.isSessionOpen$.next(true);
      })
    );
  }

  closeSession(publicId: string, finalAmount: number, notes?: string): Observable<GlobalSession> {
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
