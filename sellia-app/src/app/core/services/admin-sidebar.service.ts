import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminSidebarService {
  collapsed = signal(false);

  toggleCollapsed() {
    this.collapsed.set(!this.collapsed());
  }
}
