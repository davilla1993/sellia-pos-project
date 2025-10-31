import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cancel-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancel-order-dialog.component.html',
  styleUrls: ['./cancel-order-dialog.component.css']
})
export class CancelOrderDialogComponent {
  orderNumber = input.required<string>();
  onConfirmClick = output<string>();
  onCancelClick = output<void>();

  reason: string = '';

  onConfirm(): void {
    if (this.reason.trim()) {
      this.onConfirmClick.emit(this.reason);
    }
  }

  onCancel(): void {
    this.onCancelClick.emit();
  }
}
