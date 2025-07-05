import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, AuthState } from './shared/services/auth.service';
import { ThemeService } from './shared/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false
  };
  
  isScrolled = false;
  isMobileMenuOpen = false;
  currentTheme: 'light' | 'dark' = 'light';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.authState$.subscribe(state => {
        this.authState = state;
      })
    );
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollListener();
      this.themeService.initTheme();
      this.currentTheme = this.themeService.getTheme();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (isPlatformBrowser(this.platformId)) {
      this.removeScrollListener();
    }
  }

  private setupScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private removeScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private handleScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getTheme();
  }
}
