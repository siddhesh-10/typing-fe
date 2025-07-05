import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/typing.interface';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import { Amplify } from '@aws-amplify/core';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeAmplify();
    this.checkStoredAuth();
  }

  private initializeAmplify(): void {
    // Configure Amplify with your AWS Cognito settings
    // You'll need to replace these with your actual Cognito configuration
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: 'your-user-pool-id', // Replace with your User Pool ID
          userPoolClientId: 'your-client-id', // Replace with your Client ID
          signUpVerificationMethod: 'code',
          loginWith: {
            email: true,
            username: false
          }
        }
      }
    });
  }

  private checkStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Don't access localStorage during SSR
    }
    
    const token = localStorage.getItem('typing_auth_token');
    const userData = localStorage.getItem('typing_user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          token,
          isLoading: false
        });
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.setLoading(true);
    
    try {
      // Try AWS Cognito authentication first
      const cognitoUser = await this.cognitoLogin(email, password);
      
      if (cognitoUser) {
        const user: User = {
          id: cognitoUser.attributes.sub,
          username: cognitoUser.username,
          email: cognitoUser.attributes.email,
          country: cognitoUser.attributes.locale || 'US',
          joinDate: new Date(cognitoUser.attributes.created_at),
          totalTests: 0,
          averageWpm: 0,
          bestWpm: 0,
          totalAccuracy: 0,
          isOnline: true,
          lastActive: new Date()
        };

        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString() ?? null;
        
        this.setAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false
        });

        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('typing_auth_token', token);
        }
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('typing_user_data', JSON.stringify(user));
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      this.setLoading(false);
      
      // Handle specific Cognito errors
      if (error.code === 'NotAuthorizedException') {
        return { success: false, error: 'Invalid email or password' };
      } else if (error.code === 'UserNotConfirmedException') {
        return { success: false, error: 'Please confirm your email address' };
      } else if (error.code === 'UserNotFoundException') {
        return { success: false, error: 'User not found' };
      } else if (error.code === 'TooManyRequestsException') {
        return { success: false, error: 'Too many login attempts. Please try again later' };
      }
      
      // Fallback to mock authentication for development
      console.warn('Cognito authentication failed, using mock auth:', error);
      return this.mockLogin(email, password);
    }
  }

  async register(email: string, username: string, password: string, country: string): Promise<{ success: boolean; error?: string }> {
    this.setLoading(true);
    
    try {
      // Try AWS Cognito registration first
      const cognitoUser = await this.cognitoRegister(email, username, password);
      
      if (cognitoUser) {
        const user: User = {
          id: cognitoUser.userSub,
          username,
          email,
          country,
          joinDate: new Date(),
          totalTests: 0,
          averageWpm: 0,
          bestWpm: 0,
          totalAccuracy: 0,
          isOnline: true,
          lastActive: new Date()
        };

        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString() ?? null;
        
        this.setAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false
        });

        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('typing_auth_token', token);
        }
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('typing_user_data', JSON.stringify(user));
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      this.setLoading(false);
      
      // Handle specific Cognito errors
      if (error.code === 'UsernameExistsException') {
        return { success: false, error: 'Username already exists' };
      } else if (error.code === 'InvalidPasswordException') {
        return { success: false, error: 'Password does not meet requirements' };
      } else if (error.code === 'InvalidParameterException') {
        return { success: false, error: 'Invalid email format' };
      }
      
      // Fallback to mock registration for development
      console.warn('Cognito registration failed, using mock registration:', error);
      return this.mockRegister(email, username, password, country);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.cognitoLogout();
    } catch (error) {
      console.warn('Cognito logout failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() ?? null;
      
      if (token) {
        const currentState = this.authStateSubject.value;
        this.setAuthState({
          ...currentState,
          token
        });
        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('typing_auth_token', token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  updateUserProfile(updates: Partial<User>): void {
    const currentState = this.authStateSubject.value;
    if (currentState.user) {
      const updatedUser = { ...currentState.user, ...updates };
      this.setAuthState({
        ...currentState,
        user: updatedUser
      });
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('typing_user_data', JSON.stringify(updatedUser));
      }
    }
  }

  private setAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.setAuthState({
      ...currentState,
      isLoading
    });
  }

  private clearAuth(): void {
    this.setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('typing_auth_token');
      localStorage.removeItem('typing_user_data');
    }
  }

  private async simulateAuthDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateMockToken(): string {
    return 'mock_token_' + Math.random().toString(36).substr(2, 9);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Mock authentication methods for development/testing
  private async mockLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateAuthDelay();
    
    const mockUser: User = {
      id: '1',
      username: email.split('@')[0],
      email,
      country: 'US',
      joinDate: new Date(),
      totalTests: 0,
      averageWpm: 0,
      bestWpm: 0,
      totalAccuracy: 0,
      isOnline: true,
      lastActive: new Date()
    };

    const mockToken = this.generateMockToken();
    
    this.setAuthState({
      isAuthenticated: true,
      user: mockUser,
      token: mockToken,
      isLoading: false
    });

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('typing_auth_token', mockToken);
      localStorage.setItem('typing_user_data', JSON.stringify(mockUser));
    }
    
    return { success: true };
  }

  private async mockRegister(email: string, username: string, password: string, country: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateAuthDelay();
    
    const mockUser: User = {
      id: this.generateId(),
      username,
      email,
      country,
      joinDate: new Date(),
      totalTests: 0,
      averageWpm: 0,
      bestWpm: 0,
      totalAccuracy: 0,
      isOnline: true,
      lastActive: new Date()
    };

    const mockToken = this.generateMockToken();
    
    this.setAuthState({
      isAuthenticated: true,
      user: mockUser,
      token: mockToken,
      isLoading: false
    });

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('typing_auth_token', mockToken);
      localStorage.setItem('typing_user_data', JSON.stringify(mockUser));
    }
    
    return { success: true };
  }

  // AWS Cognito methods
  private async cognitoLogin(email: string, password: string): Promise<any> {
    try {
      const user = await signIn({ username: email, password });
      return user;
    } catch (error) {
      throw error;
    }
  }

  private async cognitoRegister(email: string, username: string, password: string): Promise<any> {
    try {
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  private async cognitoLogout(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      throw error;
    }
  }
} 