import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioNotificationService } from '@core/services/audio-notification.service';

@Component({
  selector: 'app-audio-notification-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-notification-control.component.html',
  styleUrls: ['./audio-notification-control.component.css']
})
export class AudioNotificationControlComponent {
  audioService = inject(AudioNotificationService);

  testSound(): void {
    this.audioService.playNewOrder();
  }

  handleVolumeChange(value: any): void {
    const numValue = Number(value) || 0;
    this.audioService.setVolume(numValue / 100);
  }
}
