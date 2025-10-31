import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  reportData: any = null;
  reportType: string = '';
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.filterForm = this.fb.group({
      reportType: ['', Validators.required],
      globalSessionId: [''],
      cashierId: [''],
      userId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {}

  onReportTypeChange(): void {
    this.reportType = this.filterForm.get('reportType')?.value || '';
    this.reportData = null;
    this.error = '';

    // Update validators based on report type
    if (this.reportType === 'global-session') {
      this.filterForm.get('globalSessionId')?.setValidators([Validators.required]);
      this.filterForm.get('cashierId')?.clearValidators();
      this.filterForm.get('userId')?.clearValidators();
      this.filterForm.get('startDate')?.clearValidators();
      this.filterForm.get('endDate')?.clearValidators();
    } else if (this.reportType === 'cashier') {
      this.filterForm.get('cashierId')?.setValidators([Validators.required]);
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
      this.filterForm.get('globalSessionId')?.clearValidators();
      this.filterForm.get('userId')?.clearValidators();
    } else if (this.reportType === 'user') {
      this.filterForm.get('userId')?.setValidators([Validators.required]);
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
      this.filterForm.get('globalSessionId')?.clearValidators();
      this.filterForm.get('cashierId')?.clearValidators();
    }

    this.filterForm.updateValueAndValidity();
  }

  applyFilter(): void {
    if (!this.filterForm.valid) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.reportType === 'global-session') {
      this.apiService.getGlobalSessionReport(this.filterForm.get('globalSessionId')?.value).subscribe(
        (data) => {
          this.reportData = data;
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement du rapport';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'cashier') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);
      
      this.apiService.getCashierReport(this.filterForm.get('cashierId')?.value, startDate, endDate).subscribe(
        (data) => {
          this.reportData = data;
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement du rapport';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'user') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);
      
      this.apiService.getUserReport(this.filterForm.get('userId')?.value, startDate, endDate).subscribe(
        (data) => {
          this.reportData = data;
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement du rapport';
          this.loading = false;
        }
      );
    }
  }

  downloadPdf(): void {
    if (!this.reportData) return;

    this.loading = true;

    if (this.reportType === 'global-session') {
      this.apiService.downloadGlobalSessionReportPdf(this.reportData.publicId).subscribe(
        (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-session-${this.reportData.publicId}.pdf`);
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du téléchargement du PDF';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'cashier') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadCashierReportPdf(this.reportData.cashierPublicId, startDate, endDate).subscribe(
        (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-caisse-${this.reportData.cashierPublicId}.pdf`);
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du téléchargement du PDF';
          this.loading = false;
        }
      );
    } else if (this.reportType === 'user') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadUserReportPdf(this.reportData.userPublicId, startDate, endDate).subscribe(
        (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-utilisateur-${this.reportData.userPublicId}.pdf`);
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du téléchargement du PDF';
          this.loading = false;
        }
      );
    }
  }

  formatCurrency(value: number): string {
    if (!value) return '0 FCFA';
    const formatted = Math.round(value / 100).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  calculateDuration(start: string, end: string): string {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private formatDateForApi(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString();
  }
}
