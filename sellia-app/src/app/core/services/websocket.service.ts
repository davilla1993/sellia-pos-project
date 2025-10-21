import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface WebSocketMessage {
  type: 'ORDER_PLACED' | 'ORDER_COMPLETED' | 'PAYMENT_RECEIVED' | 'STOCK_ALERT' | 'TABLE_STATUS' | 'NOTIFICATION';
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private authService = inject(AuthService);
  private ws: WebSocket | null = null;
  private messageSubject = new BehaviorSubject<WebSocketMessage | null>(null);
  private connectionStatus = signal<'connecting' | 'connected' | 'disconnected'>('disconnected');
  private messageQueue: WebSocketMessage[] = [];

  public message$ = this.messageSubject.asObservable();
  public status = this.connectionStatus;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
    const wsUrl = `${protocol}//${host}:${port}/ws/notifications`;

    this.connect(wsUrl);
  }

  connect(url: string): void {
    if (this.ws) return;

    this.connectionStatus.set('connecting');
    
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connectionStatus.set('connected');
        console.log('WebSocket connected');
        this.flushQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.set('disconnected');
      };

      this.ws.onclose = () => {
        this.connectionStatus.set('disconnected');
        this.ws = null;
        this.reconnect();
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      this.connectionStatus.set('disconnected');
    }
  }

  private reconnect(): void {
    setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.initializeConnection();
    }, 3000);
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus.set('disconnected');
  }

  isConnected(): boolean {
    return this.connectionStatus() === 'connected';
  }
}
