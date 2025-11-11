import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { RestaurantInfoService } from '@shared/services/restaurant-info.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit {
  manualEntry = signal(false);
  isProcessing = signal(false);
  error = signal<string | null>(null);
  manualForm: FormGroup;
  restaurantService = inject(RestaurantInfoService);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.manualForm = this.fb.group({
      tableNumber: ['', [Validators.required, Validators.min(1)]],
      customerName: [''],
      customerPhone: ['']
    });
  }

  ngOnInit(): void {
    this.restaurantService.loadRestaurantInfo();
  }



  toggleManualEntry(): void {
    this.manualEntry.set(!this.manualEntry());
    this.error.set(null);
  }

  submitManual(): void {
    if (this.manualForm.invalid) return;

    const { tableNumber, customerName, customerPhone } = this.manualForm.value;
    this.createSession(tableNumber.toString(), customerName, customerPhone);
  }

  private createSession(tableId: string, customerName?: string, customerPhone?: string): void {
    this.isProcessing.set(true);
    this.error.set(null);

    this.apiService.getOrCreateSession(tableId, customerName, customerPhone).subscribe({
      next: (session) => {
        this.isProcessing.set(false);
        this.router.navigate(['/customer/menu'], {
          queryParams: { sessionId: session.sessionId }
        });
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.error.set(err.error?.message || 'Failed to start session. Please try again.');
      }
    });
  }

  getFieldError(fieldName: string): boolean {
    const field = this.manualForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
