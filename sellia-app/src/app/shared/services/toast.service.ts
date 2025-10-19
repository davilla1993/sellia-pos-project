import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000) {
    const id = this.generateId();
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  remove(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
