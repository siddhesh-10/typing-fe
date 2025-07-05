import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  User, 
  TypingSession, 
  TypingStats, 
  LeaderboardEntry, 
  Challenge, 
  AIPracticeSession, 
  TypingText,
  GlobalLeaderboard,
  CountryLeaderboard
} from '../interfaces/typing.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.setupOnlineStatusListener();
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => this.isOnlineSubject.next(true));
    window.addEventListener('offline', () => this.isOnlineSubject.next(false));
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.status === 401) {
        // Handle unauthorized - could trigger token refresh or logout
        this.authService.logout();
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // User Management
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/profile`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  updateUserProfile(updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/user/profile`, updates, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getUserStats(): Observable<TypingStats> {
    return this.http.get<TypingStats>(`${this.baseUrl}/user/stats`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  getUserHistory(page: number = 1, limit: number = 20): Observable<{ sessions: TypingSession[], total: number }> {
    return this.http.get<{ sessions: TypingSession[], total: number }>(
      `${this.baseUrl}/user/history?page=${page}&limit=${limit}`, 
      { headers: this.getHeaders() }
    ).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // Typing Sessions
  saveTypingSession(session: TypingSession): Observable<TypingSession> {
    return this.http.post<TypingSession>(`${this.baseUrl}/sessions`, session, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getTypingSessions(filters?: {
    mode?: string;
    difficulty?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Observable<{ sessions: TypingSession[], total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    return this.http.get<{ sessions: TypingSession[], total: number }>(
      `${this.baseUrl}/sessions?${params.toString()}`, 
      { headers: this.getHeaders() }
    ).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // Typing Texts
  getTypingTexts(filters?: {
    difficulty?: string;
    category?: string;
    language?: string;
    limit?: number;
  }): Observable<TypingText[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    return this.http.get<TypingText[]>(`${this.baseUrl}/texts?${params.toString()}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  getRandomText(difficulty: string = 'medium', category?: string): Observable<TypingText> {
    const params = new URLSearchParams({ difficulty });
    if (category) params.append('category', category);

    return this.http.get<TypingText>(`${this.baseUrl}/texts/random?${params.toString()}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  // Leaderboards
  getGlobalLeaderboard(limit: number = 100): Observable<GlobalLeaderboard> {
    return this.http.get<GlobalLeaderboard>(`${this.baseUrl}/leaderboard/global?limit=${limit}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  getCountryLeaderboard(country: string, limit: number = 100): Observable<CountryLeaderboard> {
    return this.http.get<CountryLeaderboard>(`${this.baseUrl}/leaderboard/country/${country}?limit=${limit}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  getLeaderboardByMode(mode: string, difficulty?: string, limit: number = 100): Observable<LeaderboardEntry[]> {
    const params = new URLSearchParams({ mode, limit: limit.toString() });
    if (difficulty) params.append('difficulty', difficulty);

    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard/mode?${params.toString()}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  // Challenges
  createChallenge(challenge: Omit<Challenge, 'id' | 'createdAt' | 'status'>): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.baseUrl}/challenges`, challenge, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getChallenges(status?: string): Observable<Challenge[]> {
    const params = status ? new URLSearchParams({ status }) : new URLSearchParams();
    
    return this.http.get<Challenge[]>(`${this.baseUrl}/challenges?${params.toString()}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  acceptChallenge(challengeId: string): Observable<Challenge> {
    return this.http.patch<Challenge>(`${this.baseUrl}/challenges/${challengeId}/accept`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  declineChallenge(challengeId: string): Observable<Challenge> {
    return this.http.patch<Challenge>(`${this.baseUrl}/challenges/${challengeId}/decline`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  submitChallengeResult(challengeId: string, result: TypingSession): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.baseUrl}/challenges/${challengeId}/result`, result, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // AI Practice
  startAIPractice(aiLevel: string, text: string): Observable<AIPracticeSession> {
    return this.http.post<AIPracticeSession>(`${this.baseUrl}/ai-practice`, { aiLevel, text }, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  submitAIPracticeResult(sessionId: string, result: TypingSession): Observable<AIPracticeSession> {
    return this.http.post<AIPracticeSession>(`${this.baseUrl}/ai-practice/${sessionId}/result`, result, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Search Users
  searchUsers(query: string, limit: number = 10): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  // Analytics
  getAnalytics(timeframe: string = '7d'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics?timeframe=${timeframe}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  // Health Check
  healthCheck(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(`${this.baseUrl}/health`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  // Offline Support
  saveOfflineSession(session: TypingSession): void {
    const offlineSessions = JSON.parse(localStorage.getItem('offline_sessions') || '[]');
    offlineSessions.push(session);
    localStorage.setItem('offline_sessions', JSON.stringify(offlineSessions));
  }

  syncOfflineSessions(): Observable<any> {
    const offlineSessions = JSON.parse(localStorage.getItem('offline_sessions') || '[]');
    
    if (offlineSessions.length === 0) {
      return new Observable(subscriber => subscriber.complete());
    }

    return this.http.post(`${this.baseUrl}/sessions/bulk`, { sessions: offlineSessions }, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          localStorage.removeItem('offline_sessions');
        }),
        catchError(this.handleError.bind(this))
      );
  }
} 