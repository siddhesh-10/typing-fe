import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultOptions: Partial<NotificationOptions> = {
    duration: 3000, // 3 seconds default
    position: 'top-right',
    type: 'info'
  };

  constructor(private toastr: ToastrService) {
    // Configure toastr options
    this.toastr.toastrConfig.timeOut = 3000;
    this.toastr.toastrConfig.extendedTimeOut = 1000;
    this.toastr.toastrConfig.easing = 'ease-in';
    this.toastr.toastrConfig.easeTime = 300;
    this.toastr.toastrConfig.progressBar = true;
    this.toastr.toastrConfig.progressAnimation = 'increasing';
    this.toastr.toastrConfig.preventDuplicates = true;
    this.toastr.toastrConfig.closeButton = true;
    this.toastr.toastrConfig.tapToDismiss = true;
  }

  /**
   * Show a success notification
   */
  success(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    const config = { ...this.defaultOptions, ...options, type: 'success' as const };
    this.toastr.success(message, title || 'Success', {
      timeOut: config.duration,
      positionClass: `toast-${config.position}`
    });
  }

  /**
   * Show an error notification
   */
  error(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    const config = { ...this.defaultOptions, ...options, type: 'error' as const };
    this.toastr.error(message, title || 'Error', {
      timeOut: config.duration,
      positionClass: `toast-${config.position}`
    });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    const config = { ...this.defaultOptions, ...options, type: 'warning' as const };
    this.toastr.warning(message, title || 'Warning', {
      timeOut: config.duration,
      positionClass: `toast-${config.position}`
    });
  }

  /**
   * Show an info notification
   */
  info(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    const config = { ...this.defaultOptions, ...options, type: 'info' as const };
    this.toastr.info(message, title || 'Info', {
      timeOut: config.duration,
      positionClass: `toast-${config.position}`
    });
  }

  /**
   * Show a custom notification
   */
  show(options: NotificationOptions): void {
    const config = { ...this.defaultOptions, ...options };
    
    switch (config.type) {
      case 'success':
        this.success(config.message, config.title, config);
        break;
      case 'error':
        this.error(config.message, config.title, config);
        break;
      case 'warning':
        this.warning(config.message, config.title, config);
        break;
      case 'info':
      default:
        this.info(config.message, config.title, config);
        break;
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.toastr.clear();
  }

  /**
   * Clear specific notification
   */
  clearToast(toastId: number): void {
    this.toastr.clear(toastId);
  }
} 