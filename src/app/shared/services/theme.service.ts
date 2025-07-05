import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeKey = 'theme';

  setTheme(theme: 'light' | 'dark') {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.themeKey, theme);
  }

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(this.themeKey) as 'light' | 'dark') || 'light';
  }

  initTheme() {
    const saved = this.getTheme();
    this.setTheme(saved);
  }

  toggleTheme() {
    const current = this.getTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }
} 