import { Injectable, signal } from '@angular/core';

export interface NotificationItem {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 1;
  private _items = signal<NotificationItem[]>([]);

  // Consumido como: this.notif.notifications.asReadonly()
  notifications = this._items;

  success(message: string): void { this.add('success', message); }
  error(message: string): void { this.add('error', message); }
  info(message: string): void { this.add('info', message); }

  remove(id: number): void {
    this._items.update((list) => list.filter((n) => n.id !== id));
  }

  private add(type: NotificationItem['type'], message: string): void {
    const id = this.seq++;
    this._items.update((list) => [...list, { id, type, message }]);
    // Autodescartar tras 5 segundos
    setTimeout(() => this.remove(id), 5000);
  }
}