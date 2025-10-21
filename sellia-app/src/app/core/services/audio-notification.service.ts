import { Injectable, signal } from '@angular/core';

type SoundType = 'new-order' | 'order-ready' | 'payment-complete';

@Injectable({
  providedIn: 'root'
})
export class AudioNotificationService {
  notificationsEnabled = signal(true);
  volume = signal(0.7);

  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();

  constructor() {
    this.initAudioContext();
    this.loadSounds();
    this.loadSettings();
  }

  private initAudioContext(): void {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not available:', e);
      }
    }
  }

  private loadSounds(): void {
    // Créer des sons synthétiques avec Web Audio API
    this.createNewOrderSound();
    this.createOrderReadySound();
    this.createPaymentCompleteSound();
  }

  private createNewOrderSound(): void {
    if (!this.audioContext) return;
    
    // Bip bip bip (3 bips rapides) pour nouvelle commande
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const frequency = 800;
    const sampleRate = this.audioContext.sampleRate;
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      if ((t % 0.5) < 0.15) {
        data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3;
      }
    }
    
    this.sounds.set('new-order', buffer);
  }

  private createOrderReadySound(): void {
    if (!this.audioContext) return;
    
    // Son plus mélodieux (2 notes) pour commande prête
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.6, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const sampleRate = this.audioContext.sampleRate;
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      let frequency = 600;
      
      // Deux notes: première de 0 à 0.3s, deuxième de 0.3s à 0.6s
      if (t > 0.3) {
        frequency = 800;
      }
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3;
    }
    
    this.sounds.set('order-ready', buffer);
  }

  private createPaymentCompleteSound(): void {
    if (!this.audioContext) return;
    
    // Son plus haut et court (ding!) pour paiement complété
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const frequency = 1200;
    const sampleRate = this.audioContext.sampleRate;
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 5); // Decay envelope
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    this.sounds.set('payment-complete', buffer);
  }

  play(soundType: SoundType): void {
    if (!this.notificationsEnabled() || !this.audioContext) {
      return;
    }

    const buffer = this.sounds.get(soundType);
    if (!buffer) {
      console.warn(`Sound ${soundType} not found`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.volume();
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  }

  playNewOrder(): void {
    this.play('new-order');
  }

  playOrderReady(): void {
    this.play('order-ready');
  }

  playPaymentComplete(): void {
    this.play('payment-complete');
  }

  toggleNotifications(): void {
    this.notificationsEnabled.set(!this.notificationsEnabled());
    this.saveSettings();
  }

  setVolume(volume: number): void {
    this.volume.set(Math.max(0, Math.min(1, volume)));
    this.saveSettings();
  }

  private saveSettings(): void {
    const settings = {
      enabled: this.notificationsEnabled(),
      volume: this.volume()
    };
    localStorage.setItem('audioNotificationSettings', JSON.stringify(settings));
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('audioNotificationSettings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (typeof settings.enabled === 'boolean') {
          this.notificationsEnabled.set(settings.enabled);
        }
        if (typeof settings.volume === 'number') {
          this.volume.set(settings.volume);
        }
      } catch (e) {
        console.warn('Error loading audio settings:', e);
      }
    }
  }
}
