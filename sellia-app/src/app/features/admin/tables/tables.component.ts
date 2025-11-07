import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  tables = signal<any[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  
  showModal = false;
  editingTable: any = null;
  tableForm: FormGroup;

  constructor() {
    this.tableForm = this.fb.group({
      number: ['', Validators.required],
      name: [''],
      room: ['', Validators.required],
      capacity: [4, [Validators.required, Validators.min(1)]],
      isVip: [false],
      available: [true]
    });
  }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.isLoading.set(true);
    this.apiService.getTables().subscribe({
      next: (response: any) => {
        const tablesList = response.content || response.data || response;
        this.tables.set(Array.isArray(tablesList) ? tablesList : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des tables');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingTable = null;
    this.tableForm.reset({ isVip: false, capacity: 4 });
    this.showModal = true;
  }

  editTable(table: any): void {
    this.editingTable = table;
    this.tableForm.patchValue({
      number: table.number,
      name: table.name,
      room: table.room,
      capacity: table.capacity,
      isVip: table.isVip || false,
      available: table.available !== false
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTable = null;
    this.tableForm.reset({ isVip: false, capacity: 4 });
  }

  saveTable(): void {
    if (!this.tableForm.valid) return;
    this.isSaving.set(true);

    const data = this.tableForm.value;

    if (this.editingTable) {
      this.apiService.updateTable(this.editingTable.publicId, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.success.set('Table modifiée avec succès');
          this.closeModal();
          this.loadTables();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err.error?.message || err.error?.error || 'Erreur lors de la modification';
          this.error.set(errorMsg);
          console.error('Update error:', err);
          setTimeout(() => this.error.set(null), 3000);
        }
      });
    } else {
      this.apiService.createTable(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.success.set('Table créée avec succès');
          this.closeModal();
          this.loadTables();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err.error?.message || err.error?.error || 'Erreur lors de la création';
          this.error.set(errorMsg);
          console.error('Create error:', err);
          setTimeout(() => this.error.set(null), 3000);
        }
      });
    }
  }

  deleteTable(table: any): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la table "${table.name}"?`)) return;
    
    this.apiService.deleteTable(table.publicId).subscribe({
      next: () => {
        this.success.set('Table supprimée');
        this.loadTables();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.error.set('Erreur lors de la suppression');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  generateQrCode(table: any): void {
    table.generatingQr = true;
    this.apiService.generateTableQrCode(table.publicId).subscribe({
      next: () => {
        table.generatingQr = false;
        this.success.set('QR code généré');
        this.loadTables();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        table.generatingQr = false;
        this.error.set('Erreur génération QR');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  downloadQrCode(table: any): void {
    if (!table.qrCodeUrl) {
      this.error.set('QR code non disponible');
      setTimeout(() => this.error.set(null), 3000);
      return;
    }

    const qrCodeUrl = this.getQrCodeUrl(table.qrCodeUrl);
    
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${table.number}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.success.set('QR code téléchargé');
        setTimeout(() => this.success.set(null), 2000);
      })
      .catch(error => {
        console.error('Erreur téléchargement QR code:', error);
        this.error.set('Erreur lors du téléchargement');
        setTimeout(() => this.error.set(null), 3000);
      });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': '✅ Disponible',
      'OCCUPIED': '🔴 Occupée',
      'RESERVED': '🟡 Réservée'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'AVAILABLE': 'bg-green-900/30 text-green-300 border border-green-600',
      'OCCUPIED': 'bg-red-900/30 text-red-300 border border-red-600',
      'RESERVED': 'bg-yellow-900/30 text-yellow-300 border border-yellow-600'
    };
    return classes[status] || 'bg-neutral-700 text-neutral-300';
  }

  getCountByStatus(status: string): number {
    return this.tables().filter(t => t.status === status).length;
  }

  getQrCodeUrl(qrCodeUrl: string): string {
    if (!qrCodeUrl) return '';
    if (qrCodeUrl.startsWith('http')) return qrCodeUrl;

    // qrCodeUrl contient déjà le chemin complet genre "/uploads/qrcodes/xxx.png"
    // En dev: environment.uploadsUrl = "http://localhost:8080/uploads"
    // En prod: environment.uploadsUrl = "/uploads"

    if (environment.uploadsUrl.startsWith('http')) {
      // Dev: enlever "/uploads" de la baseUrl car qrCodeUrl l'a déjà
      const baseUrl = environment.uploadsUrl.replace('/uploads', '');
      return `${baseUrl}${qrCodeUrl}`;
    } else {
      // Prod: URL relative, juste retourner qrCodeUrl
      return qrCodeUrl;
    }
  }

  getMenuUrl(tablePublicId: string): string {
    return `${window.location.origin}/menu?table=${tablePublicId}`;
  }

  getQrMenuUrl(tablePublicId: string): string {
    return `${window.location.origin}/menu?table=${tablePublicId}`;
  }

  openQrMenu(table: any): void {
    this.router.navigate(['/menu'], { 
      queryParams: { table: table.publicId } 
    });
  }
}
