import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, interval } from 'rxjs';
import { map, takeWhile, tap } from 'rxjs/operators';
import { TypingSession, TypingProgress, TypingError, TypingText, TypingStats } from '../interfaces/typing.interface';
import defaultTypingTexts from '../../../assets/data/default-typing-texts.json';

@Injectable({
  providedIn: 'root'
})
export class TypingService {
  private currentSessionSubject = new BehaviorSubject<TypingSession | null>(null);
  private typingProgressSubject = new BehaviorSubject<TypingProgress | null>(null);
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  private wpmSubject = new BehaviorSubject<number>(0);
  private accuracySubject = new BehaviorSubject<number>(100);
  private errorsSubject = new BehaviorSubject<TypingError[]>([]);

  public currentSession$ = this.currentSessionSubject.asObservable();
  public typingProgress$ = this.typingProgressSubject.asObservable();
  public isTyping$ = this.isTypingSubject.asObservable();
  public wpm$ = this.wpmSubject.asObservable();
  public accuracy$ = this.accuracySubject.asObservable();
  public errors$ = this.errorsSubject.asObservable();

  private sessionStartTime: Date | null = null;
  private lastWpmCalculation: Date | null = null;
  private wpmInterval: any;
  private currentText: TypingText | null = null;
  private errorCount = 0;
  private totalKeystrokes = 0;
  private correctKeystrokes = 0;

  constructor() {}

  // Load default typing texts when API fails
  getDefaultTypingTexts(difficulty?: 'easy' | 'medium' | 'hard' | 'expert', category?: string): TypingText[] {
    let texts = defaultTypingTexts.typingTexts as TypingText[];
    
    if (difficulty) {
      texts = texts.filter(text => text.difficulty === difficulty);
    }
    
    if (category) {
      texts = texts.filter(text => text.category === category);
    }
    
    return texts;
  }

  // Get a random default text with better filtering
  getRandomDefaultText(difficulty?: 'easy' | 'medium' | 'hard' | 'expert', category?: string): TypingText | null {
    let texts = defaultTypingTexts.typingTexts as TypingText[];
    
    // Filter by difficulty if specified
    if (difficulty) {
      texts = texts.filter(text => text.difficulty === difficulty);
    }
    
    // Filter by category if specified
    if (category) {
      texts = texts.filter(text => text.category === category);
    }
    
    // If no texts match the criteria, return any text of the specified difficulty
    if (texts.length === 0 && difficulty) {
      texts = defaultTypingTexts.typingTexts.filter(text => text.difficulty === difficulty) as TypingText[];
    }
    
    // If still no texts, return any text
    if (texts.length === 0) {
      texts = defaultTypingTexts.typingTexts as TypingText[];
    }
    
    if (texts.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * texts.length);
    return texts[randomIndex];
  }

  // Fallback method when API fails
  async getTypingTexts(difficulty?: 'easy' | 'medium' | 'hard' | 'expert', category?: string): Promise<TypingText[]> {
    try {
      // For now, always use default texts since API service is not injected
      // In the future, you can inject ApiService and make real API calls here
      console.log('Using default typing texts');
      return this.getDefaultTypingTexts(difficulty, category);
    } catch (error) {
      console.warn('Error getting typing texts, using defaults:', error);
      return this.getDefaultTypingTexts(difficulty, category);
    }
  }

  startSession(text: TypingText, mode: 'practice' | 'challenge' | 'ai' = 'practice', difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium'): void {
    this.currentText = text;
    this.sessionStartTime = new Date();
    this.errorCount = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    
    const session: TypingSession = {
      id: this.generateId(),
      text: text.text,
      words: text.words,
      startTime: this.sessionStartTime,
      duration: 0,
      wpm: 0,
      accuracy: 100,
      errors: 0,
      totalWords: text.wordCount,
      completedWords: 0,
      isCompleted: false,
      mode,
      difficulty,
      category: text.category
    };

    const progress: TypingProgress = {
      currentWordIndex: 0,
      currentCharIndex: 0,
      completedWords: 0,
      errors: [],
      startTime: this.sessionStartTime,
      isActive: true
    };

    this.currentSessionSubject.next(session);
    this.typingProgressSubject.next(progress);
    this.isTypingSubject.next(true);
    this.errorsSubject.next([]);

    // Start WPM calculation interval
    this.startWpmCalculation();
  }

  private startWpmCalculation(): void {
    this.wpmInterval = interval(1000).pipe(
      takeWhile(() => this.isTypingSubject.value)
    ).subscribe(() => {
      this.calculateWpm();
    });
  }

  private calculateWpm(): void {
    const progress = this.typingProgressSubject.value;
    if (!progress || !this.sessionStartTime) return;

    const elapsedMinutes = (Date.now() - this.sessionStartTime.getTime()) / 60000;
    const wpm = elapsedMinutes > 0 ? Math.round(this.correctKeystrokes / elapsedMinutes) : 0;
    
    this.wpmSubject.next(wpm);
    this.updateSessionWpm(wpm);
  }

  private updateSessionWpm(wpm: number): void {
    const session = this.currentSessionSubject.value;
    if (session) {
      session.wpm = wpm;
      this.currentSessionSubject.next(session);
    }
  }

  handleKeyPress(key: string, expectedChar: string, wordIndex: number, charIndex: number): void {
    this.totalKeystrokes++;
    
    if (key === expectedChar) {
      this.correctKeystrokes++;
      this.updateProgress(wordIndex, charIndex + 1);
    } else {
      this.errorCount++;
      this.addError(wordIndex, charIndex, expectedChar, key);
      this.updateProgress(wordIndex, charIndex + 1);
    }
    
    this.updateStats();
  }

  private updateProgress(wordIndex: number, charIndex: number): void {
    const currentProgress = this.typingProgressSubject.value;
    if (!currentProgress || !this.currentText) return;
    
    const currentWord = this.currentText.words[wordIndex];
    let newWordIndex = wordIndex;
    let newCharIndex = charIndex;
    
    // Move to next word if current word is completed
    if (charIndex >= currentWord.length) {
      newWordIndex = wordIndex + 1;
      newCharIndex = 0;
    }
    
    const updatedProgress: TypingProgress = {
      ...currentProgress,
      currentWordIndex: newWordIndex,
      currentCharIndex: newCharIndex,
      completedWords: newWordIndex,
      errors: this.errorsSubject.value
    };
    
    this.typingProgressSubject.next(updatedProgress);
    
    // Check if session is complete
    if (newWordIndex >= this.currentText.words.length) {
      this.completeSession();
    }
  }

  private addError(wordIndex: number, charIndex: number, expected: string, actual: string): void {
    const error: TypingError = {
      position: this.calculateAbsolutePosition(wordIndex, charIndex),
      expected,
      actual,
      timestamp: new Date()
    };
    
    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, error]);
  }

  private calculateAbsolutePosition(wordIndex: number, charIndex: number): number {
    let position = 0;
    if (!this.currentText) return position;
    
    for (let i = 0; i < wordIndex; i++) {
      position += this.currentText.words[i].length + 1; // +1 for space
    }
    position += charIndex;
    
    return position;
  }

  private updateStats(): void {
    if (!this.sessionStartTime) return;
    
    const elapsedTime = (Date.now() - this.sessionStartTime.getTime()) / 1000 / 60; // in minutes
    const wpm = elapsedTime > 0 ? Math.round(this.correctKeystrokes / 5 / elapsedTime) : 0;
    const accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;
    
    this.wpmSubject.next(wpm);
    this.accuracySubject.next(accuracy);
  }

  completeSession(): TypingSession | null {
    if (!this.currentText || !this.sessionStartTime) return null;
    
    const endTime = new Date();
    const duration = (endTime.getTime() - this.sessionStartTime.getTime()) / 1000;
    const wpm = duration > 0 ? Math.round((this.correctKeystrokes / 5) / (duration / 60)) : 0;
    const accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;
    
    const session: TypingSession = {
      id: this.generateId(),
      text: this.currentText.text,
      words: this.currentText.words,
      startTime: this.sessionStartTime,
      endTime: endTime,
      duration: Math.round(duration),
      wpm,
      accuracy,
      errors: this.errorCount,
      totalWords: this.currentText.words.length,
      completedWords: this.currentText.words.length,
      isCompleted: true,
      mode: 'practice',
      difficulty: this.currentText.difficulty,
      category: this.currentText.category
    };
    
    this.currentSessionSubject.next(session);
    this.isTypingSubject.next(false);
    
    return session;
  }

  pauseSession(): void {
    this.isTypingSubject.next(false);
    if (this.wpmInterval) {
      this.wpmInterval.unsubscribe();
    }
  }

  resumeSession(): void {
    this.isTypingSubject.next(true);
    this.startWpmCalculation();
  }

  resetSession(): void {
    this.currentSessionSubject.next(null);
    this.typingProgressSubject.next(null);
    this.isTypingSubject.next(false);
    this.wpmSubject.next(0);
    this.accuracySubject.next(100);
    this.errorsSubject.next([]);
    
    if (this.wpmInterval) {
      this.wpmInterval.unsubscribe();
    }
    this.currentText = null;
    this.sessionStartTime = null;
    this.errorCount = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
  }

  calculateStats(sessions: TypingSession[]): TypingStats {
    if (sessions.length === 0) {
      return {
        totalTests: 0,
        averageWpm: 0,
        bestWpm: 0,
        averageAccuracy: 0,
        totalWordsTyped: 0,
        totalTimeTyping: 0,
        currentStreak: 0,
        longestStreak: 0,
        rank: 0,
        percentile: 0
      };
    }

    const totalTests = sessions.length;
    const averageWpm = Math.round(sessions.reduce((sum, session) => sum + session.wpm, 0) / totalTests);
    const bestWpm = Math.max(...sessions.map(session => session.wpm));
    const averageAccuracy = Math.round(sessions.reduce((sum, session) => sum + session.accuracy, 0) / totalTests);
    const totalWordsTyped = sessions.reduce((sum, session) => sum + session.completedWords, 0);
    const totalTimeTyping = sessions.reduce((sum, session) => sum + session.duration, 0) / 60; // Convert to minutes

    return {
      totalTests,
      averageWpm,
      bestWpm,
      averageAccuracy,
      totalWordsTyped,
      totalTimeTyping,
      currentStreak: 0, // TODO: Implement streak calculation
      longestStreak: 0, // TODO: Implement streak calculation
      rank: 0, // TODO: Implement rank calculation
      percentile: 0 // TODO: Implement percentile calculation
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getCurrentSession(): TypingSession | null {
    return this.currentSessionSubject.value;
  }

  getTypingProgress(): TypingProgress | null {
    return this.typingProgressSubject.value;
  }

  isCurrentlyTyping(): boolean {
    return this.isTypingSubject.value;
  }
} 