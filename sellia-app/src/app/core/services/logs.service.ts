import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LogEntry {
  timestamp: string;
  level: string;
  logger: string;
  message: string;
  threadName: string;
  exception?: string;
}

export interface LogStats {
  totalLogs: number;
  infoCount: number;
  warnCount: number;
  errorCount: number;
  debugCount: number;
  infoPercent: number;
  warnPercent: number;
  errorPercent: number;
  debugPercent: number;
}

export interface TimeSeriesData {
  timeSeries: {
    [hour: string]: {
      [level: string]: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/logs`;

  /**
   * Get logs with filters
   */
  getLogs(
    startDate?: Date,
    endDate?: Date,
    level?: string,
    search?: string
  ): Observable<LogEntry[]> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    if (level && level !== 'ALL') {
      params = params.set('level', level);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<LogEntry[]>(this.apiUrl, { params });
  }

  /**
   * Get log statistics
   */
  getStats(startDate?: Date, endDate?: Date): Observable<LogStats> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<LogStats>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Get time series data for charts
   */
  getTimeSeries(startDate?: Date, endDate?: Date): Observable<TimeSeriesData> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<TimeSeriesData>(`${this.apiUrl}/timeseries`, { params });
  }

  /**
   * Clear all logs
   */
  clearLogs(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl);
  }
}
