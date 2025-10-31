import { Component, signal, input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WritableSignal } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.css']
})
export class SecuritySettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  
  closeSignal = input<WritableSignal<boolean>>();
  activeSessions = signal(0);
  
  ngOnInit(): void {
    this.loadActiveSessions();
  }

  private loadActiveSessions(): void {
    this.apiService.getActiveSessions().subscribe({
      next: (count) => {
        this.activeSessions.set(count);
      },
      error: (err) => {
        console.error('Error loading active sessions:', err);
        this.activeSessions.set(0);
      }
    });
  }

  security = {
    inactivityTimeout: 15,
    maxLoginAttempts: 3,
    lockoutDuration: 15,
    twoFactorAuth: false,
    ipWhitelist: false,
    requireStrongPasswords: true,
    enableAuditLog: true
  };

  closeModal(): void {
    this.closeSignal()?.set(false);
  }

  save(): void {
    console.log('Security settings saved:', this.security);
    this.closeModal();
  }

  forceLogoutAll(): void {
    console.log('Force logout all users');
  }
}
