import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private wsUrl = environment.wsUrl;
  private socket: WebSocket | null = null;
  
  private kitchenNotificationsSubject = new Subject<any>();
  public kitchenNotifications$ = this.kitchenNotificationsSubject.asObservable();

  private cashierNotificationsSubject = new Subject<any>();
  public cashierNotifications$ = this.cashierNotificationsSubject.asObservable();

  private tableNotificationsSubject = new Subject<any>();
  public tableNotifications$ = this.tableNotificationsSubject.asObservable();

  private orderUpdatesSubject = new Subject<any>();
  public orderUpdates$ = this.orderUpdatesSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  private handleMessage(data: any): void {
    const { type, payload } = data;

    switch (type) {
      case 'KITCHEN_NOTIFICATION':
        this.kitchenNotificationsSubject.next(payload);
        break;
      case 'CASHIER_NOTIFICATION':
        this.cashierNotificationsSubject.next(payload);
        break;
      case 'TABLE_NOTIFICATION':
        this.tableNotificationsSubject.next(payload);
        break;
      case 'ORDER_UPDATE':
        this.orderUpdatesSubject.next(payload);
        break;
    }
  }

  subscribe(destination: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'SUBSCRIBE',
        destination
      }));
    }
  }

  subscribeToKitchen(): void {
    this.subscribe('/topic/kitchen');
  }

  subscribeToCashier(): void {
    this.subscribe('/topic/cashier');
  }

  subscribeToTable(tableId: string): void {
    this.subscribe(`/topic/table/${tableId}`);
  }

  sendMessage(destination: string, message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'SEND',
        destination,
        payload: message
      }));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
