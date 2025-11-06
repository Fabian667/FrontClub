import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-container">
      <div *ngFor="let n of items()" class="toast" [class.success]="n.type==='success'" [class.error]="n.type==='error'" [class.info]="n.type==='info'">
        <span class="msg">{{ n.message }}</span>
        <button class="close" (click)="dismiss(n.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .notif-container { position: fixed; top: 1rem; right: 1rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; }
    .toast { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.8rem; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); color: #1f2d3d; background: #ffffff; border-left: 4px solid #888; min-width: 240px; }
    .toast.success { border-left-color: #2ecc71; }
    .toast.error { border-left-color: #e74c3c; }
    .toast.info { border-left-color: #3498db; }
    .msg { flex: 1; }
    .close { background: transparent; border: none; font-size: 1.2rem; line-height: 1; color: #555; cursor: pointer; }
    .close:hover { color: #000; }
  `]
})
export class NotificationBannerComponent {
  private notif = inject(NotificationService);
  items = this.notif.notifications.asReadonly();

  dismiss(id: number) {
    this.notif.remove(id);
  }
}