import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = signal<boolean>(this.loadTheme());

  constructor() {
    // Apply theme changes immediately
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  isDark() {
    return this.isDarkMode;
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  private loadTheme(): boolean {
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored === 'light') return false;
    if (stored === 'dark') return true;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return false; // Ignore system preference
    }

    // Default to light mode
    return false;
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
