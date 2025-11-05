import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CashOperation {
  publicId: string;
  cashierSessionPublicId: string;
  cashierName: string;
  userName: string;
  type: 'ENTREE' | 'SORTIE';
  amount: number;
  description: string;
  reference?: string;
  authorizedBy: string;
  operationDate: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashOperationTotals {
  totalEntrees: number;
  totalSorties: number;
  netAmount: number;
  entreesCount: number;
  sortiesCount: number;
}

export interface CashOperationCreateRequest {
  cashierSessionId: string;
  type: 'ENTREE' | 'SORTIE';
  amount: number;
  description: string;
  reference?: string;
  authorizedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class CashOperationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createCashOperation(request: CashOperationCreateRequest): Observable<CashOperation> {
    return this.http.post<CashOperation>(`${this.apiUrl}/cash-operations`, request);
  }

  getOperationsBySession(sessionId: string): Observable<CashOperation[]> {
    return this.http.get<CashOperation[]>(`${this.apiUrl}/cash-operations/session/${sessionId}`);
  }

  getOperationsBySessionPaged(sessionId: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/cash-operations/session/${sessionId}/paged`, { params });
  }

  getTotalsBySession(sessionId: string): Observable<CashOperationTotals> {
    return this.http.get<CashOperationTotals>(`${this.apiUrl}/cash-operations/session/${sessionId}/totals`);
  }

  getAllOperations(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/cash-operations`, { params });
  }

  getOperationsByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/cash-operations/date-range`, { params });
  }

  getOperationsByCashier(cashierId: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/cash-operations/cashier/${cashierId}`, { params });
  }

  getOperationById(publicId: string): Observable<CashOperation> {
    return this.http.get<CashOperation>(`${this.apiUrl}/cash-operations/${publicId}`);
  }

  updateAdminNotes(publicId: string, adminNotes: string): Observable<CashOperation> {
    return this.http.put<CashOperation>(`${this.apiUrl}/cash-operations/${publicId}/admin-notes`, { adminNotes });
  }

  deleteCashOperation(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cash-operations/${publicId}`);
  }
}
