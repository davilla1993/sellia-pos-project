import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RetentionConfig {
  retentionDays: number;
  archiveEnabled: boolean;
  archivePath: string;
}

export interface ArchiveResult {
  success: boolean;
  message: string;
  archivedCount: number;
  deletedCount: number;
  archiveFile: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditRetentionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/audit-logs/retention`;

  /**
   * Get retention configuration
   */
  getConfig(): Observable<RetentionConfig> {
    return this.http.get<RetentionConfig>(`${this.apiUrl}/config`);
  }

  /**
   * Manually trigger archive and cleanup
   */
  archiveNow(): Observable<ArchiveResult> {
    return this.http.post<ArchiveResult>(`${this.apiUrl}/archive`, {});
  }
}
