import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { RestaurantInfoService } from '@shared/services/restaurant-info.service';
import { SessionReportComponent } from '@shared/components/session-report/session-report';

type ReportType = 'sales' | 'cashiers' | 'staff' | 'products' | 'sessions';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SessionReportComponent],
  templateUrl: './reports.component.html',
  styleUrls: []
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  reportData = signal<any>(null);
  currentReportType = signal<ReportType>('sales');
  loading = signal(false);
  error = signal('');
  restaurantService = inject(RestaurantInfoService);

  // Lists for dropdowns
  globalSessions = signal<any[]>([]);
  cashiers = signal<any[]>([]);
  users = signal<any[]>([]);

  loadingLists = signal(false);

  // Session report
  selectedSessionId = signal<string | null>(null);
  sessionIdInput = ''; // Non-signal property for ngModel
  cashierSessions = signal<any[]>([]);

  // Pagination for sessions
  currentPage = signal(0);
  pageSize = 10;
  totalPages = signal(0);
  totalElements = signal(0);

  // Advanced search for sessions
  searchCashierId = '';
  searchCashierNumber = '';
  searchStartDate = '';
  searchEndDate = '';
  cashiersForSearch = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      globalSessionId: [''],
      cashierId: [''],
      userId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.restaurantService.loadRestaurantInfo();

    // Detect route and set report type
    this.route.url.subscribe(urlSegments => {
      const lastSegment = urlSegments[urlSegments.length - 1]?.path;
      if (lastSegment && ['sales', 'cashiers', 'staff', 'products', 'sessions'].includes(lastSegment)) {
        this.currentReportType.set(lastSegment as ReportType);
      } else {
        this.currentReportType.set('sales');
      }
      this.loadDropdownData();
      this.updateValidators();
    });

    // Set default dates (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.filterForm.patchValue({
      startDate: this.formatDateForInput(startDate),
      endDate: this.formatDateForInput(endDate)
    });
  }

  loadDropdownData(): void {
    this.loadingLists.set(true);

    const type = this.currentReportType();

    if (type === 'sales') {
      // Load global sessions
      this.apiService.getAllGlobalSessions().subscribe({
        next: (sessions) => {
          this.globalSessions.set(sessions);
          this.loadingLists.set(false);
        },
        error: () => {
          this.globalSessions.set([]);
          this.loadingLists.set(false);
        }
      });
    } else if (type === 'cashiers') {
      // Load cashiers
      this.apiService.getAllCashiers().subscribe({
        next: (cashiers) => {
          this.cashiers.set(cashiers);
          this.loadingLists.set(false);
        },
        error: () => {
          this.cashiers.set([]);
          this.loadingLists.set(false);
        }
      });
    } else if (type === 'staff') {
      // Load users
      this.apiService.getUsers().subscribe({
        next: (users) => {
          this.users.set(users);
          this.loadingLists.set(false);
        },
        error: () => {
          this.users.set([]);
          this.loadingLists.set(false);
        }
      });
    } else if (type === 'sessions') {
      // Load cashiers for search dropdown
      this.apiService.getAllCashiers().subscribe({
        next: (cashiers) => {
          this.cashiersForSearch.set(cashiers);
        },
        error: () => {
          this.cashiersForSearch.set([]);
        }
      });

      // Initialize search dates to last month
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      this.searchStartDate = this.formatDateForInput(startDate);
      this.searchEndDate = this.formatDateForInput(endDate);

      // Load cashier sessions
      this.loadSessionsPage(0);
    } else {
      this.loadingLists.set(false);
    }
  }

  updateValidators(): void {
    const type = this.currentReportType();

    // Clear all validators first
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.clearValidators();
    });

    // Set validators based on report type
    if (type === 'sales') {
      this.filterForm.get('globalSessionId')?.setValidators([Validators.required]);
    } else if (type === 'cashiers') {
      this.filterForm.get('cashierId')?.setValidators([Validators.required]);
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
    } else if (type === 'staff') {
      this.filterForm.get('userId')?.setValidators([Validators.required]);
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
    } else if (type === 'products') {
      this.filterForm.get('startDate')?.setValidators([Validators.required]);
      this.filterForm.get('endDate')?.setValidators([Validators.required]);
    }

    this.filterForm.updateValueAndValidity();
  }

  navigateToTab(type: ReportType): void {
    this.router.navigate(['/admin/reports', type]);
  }

  navigateToSearch(): void {
    this.router.navigate(['/admin/search-invoice']);
  }

  applyFilter(): void {
    if (!this.filterForm.valid) {
      this.error.set('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.reportData.set(null);

    const type = this.currentReportType();

    if (type === 'sales') {
      this.apiService.getGlobalSessionReport(this.filterForm.get('globalSessionId')?.value).subscribe({
        next: (data) => {
          this.reportData.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du chargement du rapport de ventes');
          this.loading.set(false);
        }
      });
    } else if (type === 'cashiers') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.getCashierReport(this.filterForm.get('cashierId')?.value, startDate, endDate).subscribe({
        next: (data) => {
          this.reportData.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du chargement du rapport de caisse');
          this.loading.set(false);
        }
      });
    } else if (type === 'staff') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.getUserReport(this.filterForm.get('userId')?.value, startDate, endDate).subscribe({
        next: (data) => {
          this.reportData.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du chargement du rapport du personnel');
          this.loading.set(false);
        }
      });
    } else if (type === 'products') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.getProductReport(startDate, endDate).subscribe({
        next: (data) => {
          this.reportData.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du chargement du rapport des produits');
          this.loading.set(false);
        }
      });
    }
  }

  downloadPdf(): void {
    const data = this.reportData();
    if (!data) return;

    this.loading.set(true);
    const type = this.currentReportType();

    if (type === 'sales') {
      this.apiService.downloadGlobalSessionReportPdf(data.publicId).subscribe({
        next: (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-ventes-${data.publicId}.pdf`);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du téléchargement du PDF');
          this.loading.set(false);
        }
      });
    } else if (type === 'cashiers') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadCashierReportPdf(data.cashierPublicId, startDate, endDate).subscribe({
        next: (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-caisse-${data.cashierPublicId}.pdf`);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du téléchargement du PDF');
          this.loading.set(false);
        }
      });
    } else if (type === 'staff') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadUserReportPdf(data.userPublicId, startDate, endDate).subscribe({
        next: (blob) => {
          this.apiService.downloadPdfFile(blob, `rapport-personnel-${data.userPublicId}.pdf`);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du téléchargement du PDF');
          this.loading.set(false);
        }
      });
    } else if (type === 'products') {
      const startDate = this.formatDateForApi(this.filterForm.get('startDate')?.value);
      const endDate = this.formatDateForApi(this.filterForm.get('endDate')?.value);

      this.apiService.downloadProductReportPdf(startDate, endDate).subscribe({
        next: (blob) => {
          this.apiService.downloadPdfFile(blob, 'rapport-produits.pdf');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du téléchargement du PDF');
          this.loading.set(false);
        }
      });
    }
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '0 FCFA';
    const formatted = Math.round(value).toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateForApi(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString();
  }

  // Session report methods
  viewSessionReport(): void {
    const sessionId = this.sessionIdInput.trim();
    if (!sessionId) {
      this.error.set('Veuillez entrer un ID de session');
      return;
    }
    this.selectedSessionId.set(sessionId);
  }

  selectSessionFromList(sessionId: string): void {
    this.selectedSessionId.set(sessionId);
    this.sessionIdInput = sessionId;
  }

  clearSessionReport(): void {
    this.selectedSessionId.set(null);
    this.sessionIdInput = '';
  }

  // Pagination methods for sessions
  loadSessionsPage(page: number): void {
    this.loadingLists.set(true);
    this.currentPage.set(page);

    // Use search dates
    const startDateStr = this.searchStartDate ? this.formatDateForApi(this.searchStartDate) : '';
    const endDateStr = this.searchEndDate ? this.formatDateForApi(this.searchEndDate) : '';

    this.apiService.getAllCashierSessions(page, this.pageSize, startDateStr, endDateStr).subscribe({
      next: (response: any) => {
        let sessions = response?.content || [];

        // Filter by cashier if specified (client-side filtering since backend doesn't support it yet)
        if (this.searchCashierId) {
          sessions = sessions.filter((s: any) => s.cashier?.publicId === this.searchCashierId);
        }

        // Filter by cashier number if specified (client-side filtering)
        if (this.searchCashierNumber) {
          sessions = sessions.filter((s: any) =>
            s.cashier?.cashierNumber && s.cashier.cashierNumber.toLowerCase().includes(this.searchCashierNumber.toLowerCase())
          );
        }

        this.cashierSessions.set(sessions);

        // Note: When client-side filtering is applied, pagination info becomes approximate
        if (this.searchCashierId || this.searchCashierNumber) {
          // Recalculate pagination for filtered results
          this.totalElements.set(sessions.length);
          this.totalPages.set(1); // All results on one page after filtering
        } else {
          this.totalPages.set(response?.totalPages || 0);
          this.totalElements.set(response?.totalElements || 0);
        }

        this.loadingLists.set(false);
      },
      error: () => {
        this.cashierSessions.set([]);
        this.totalPages.set(0);
        this.totalElements.set(0);
        this.loadingLists.set(false);
      }
    });
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.loadSessionsPage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadSessionsPage(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadSessionsPage(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2; // Number of pages to show on each side of current page

    const pages: number[] = [];
    const start = Math.max(0, current - delta);
    const end = Math.min(total - 1, current + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Search methods for sessions
  applySessionSearch(): void {
    this.loadSessionsPage(0); // Reset to first page when applying search
  }

  resetSessionSearch(): void {
    // Reset to last month
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    this.searchStartDate = this.formatDateForInput(startDate);
    this.searchEndDate = this.formatDateForInput(endDate);
    this.searchCashierId = '';
    this.searchCashierNumber = '';
    this.loadSessionsPage(0);
  }
}
