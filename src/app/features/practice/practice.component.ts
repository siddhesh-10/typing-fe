import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypingDisplayComponent } from '../../shared/components/typing-display/typing-display.component';
import { OnScreenKeyboardComponent } from '../../shared/components/on-screen-keyboard/on-screen-keyboard.component';
import { TypingService } from '../../shared/services/typing.service';
import { ApiService } from '../../shared/services/api.service';
import { NotificationService } from '../../shared/services/notification.service';
import { TypingText, TypingSession } from '../../shared/interfaces/typing.interface';
import { Subscription, firstValueFrom } from 'rxjs';
import defaultTypingTexts from '../../../assets/data/default-typing-texts.json';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule, TypingDisplayComponent, OnScreenKeyboardComponent],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss']
})
export class PracticeComponent implements OnInit, OnDestroy {
  currentText: TypingText | null = null;
  completedSession: TypingSession | null = null;
  showResults = false;
  isLoading = false;
  isRestarting = false;
  isTyping = false;
  hasStarted = false;
  isOfflineMode = false;
  currentChar: string = '';
  wpm: number = 0;
  accuracy: number = 100;
  errors: any[] = [];
  progress: any = null;
  words: string[] = [];

  selectedDifficulty = 'medium';
  selectedCategory = 'general';
  selectedTimeLimit: number | null = null;
  sessionStartTime: number = 0;
  timeRemaining: number = 0;

  // Make Math available in template
  Math = Math;

  difficulties = [
    { value: 'easy', name: 'Easy', description: 'Simple words, short sentences', icon: '😊' },
    { value: 'medium', name: 'Medium', description: 'Standard vocabulary and length', icon: '😐' },
    { value: 'hard', name: 'Hard', description: 'Complex words, longer passages', icon: '😰' },
    { value: 'expert', name: 'Expert', description: 'Advanced vocabulary, technical terms', icon: '🤯' }
  ];

  categories = [
    { value: 'general', name: 'General', icon: '📚' },
    { value: 'technology', name: 'Technology', icon: '💻' },
    { value: 'literature', name: 'Literature', icon: '📖' },
    { value: 'news', name: 'News', icon: '📰' },
    { value: 'quotes', name: 'Quotes', icon: '💬' },
    { value: 'code', name: 'Code', icon: '🔧' },
    { value: 'nature', name: 'Nature', icon: '🌿' },
    { value: 'education', name: 'Education', icon: '🎓' },
    { value: 'animals', name: 'Animals', icon: '🐾' },
    { value: 'science', name: 'Science', icon: '🔬' },
    { value: 'environment', name: 'Environment', icon: '🌍' },
    { value: 'philosophy', name: 'Philosophy', icon: '🤔' }
  ];

  timeLimits = [
    { value: null, label: 'No Limit' },
    { value: 1, label: '1 Minute' },
    { value: 2, label: '2 Minutes' },
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private typingService: TypingService,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Read config from query params
    this.route.queryParams.subscribe(params => {
      this.selectedDifficulty = params['difficulty'] || 'medium';
      this.selectedCategory = params['category'] || 'general';
      this.selectedTimeLimit = params['time'] !== undefined && params['time'] !== null ? Number(params['time']) : null;
      // Only fetch the text, do not start the session yet
      this.fetchPracticeText();
    });

    // Set up typing service subscriptions
    this.setupTypingServiceSubscriptions();
  }

  private setupTypingServiceSubscriptions(): void {
    // Subscribe to typing state
    this.subscriptions.push(
      this.typingService.isTyping$.subscribe(isTyping => {
        this.isTyping = isTyping;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to typing progress
    this.subscriptions.push(
      this.typingService.typingProgress$.subscribe(progress => {
        if (progress && this.currentText) {
          const currentWord = this.currentText.words[progress.currentWordIndex];
          if (currentWord && progress.currentCharIndex < currentWord.length) {
            this.currentChar = currentWord[progress.currentCharIndex];
          } else {
            this.currentChar = '';
          }
          this.progress = progress;
          this.words = this.currentText.words;
        } else {
          this.currentChar = '';
          this.progress = null;
          this.words = [];
        }
        this.cdr.detectChanges();
      })
    );

    // Subscribe to WPM updates
    this.subscriptions.push(
      this.typingService.wpm$.subscribe(wpm => {
        this.wpm = wpm;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to accuracy updates
    this.subscriptions.push(
      this.typingService.accuracy$.subscribe(accuracy => {
        this.accuracy = accuracy;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to errors updates
    this.subscriptions.push(
      this.typingService.errors$.subscribe(errors => {
        this.errors = errors;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectDifficulty(difficulty: string): void {
    this.selectedDifficulty = difficulty;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  selectTimeLimit(timeLimit: number | null): void {
    this.selectedTimeLimit = timeLimit;
  }

  async fetchPracticeText(): Promise<void> {
    this.isLoading = true;
    this.isOfflineMode = false;
    try {
      const apiResponse = await Promise.race([
        firstValueFrom(this.apiService.getRandomText(this.selectedDifficulty, this.selectedCategory)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), 5000))
      ]);
      if (apiResponse && this.isValidTypingText(apiResponse)) {
        this.currentText = apiResponse as TypingText;
        this.isOfflineMode = false;
      } else {
        this.currentText = this.getDefaultText();
        this.notificationService.warning('Using offline mode - API returned invalid data.', 'Offline Mode', { duration: 3000 });
        this.isOfflineMode = true;
      }
    } catch (error) {
      this.currentText = this.getDefaultText();
      this.notificationService.error('Failed to load text from server. Using offline mode with default texts.', 'Connection Error', { duration: 3000 });
      this.isOfflineMode = true;
    } finally {
      // Ensure prompt is shown and avoid ExpressionChangedAfterItHasBeenCheckedError
      this.hasStarted = false;
      this.isTyping = false;
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Helper method to validate if the API response is a valid TypingText
  private isValidTypingText(response: any): response is TypingText {
    return response && 
           typeof response === 'object' &&
           typeof response.id === 'string' &&
           typeof response.text === 'string' &&
           Array.isArray(response.words) &&
           typeof response.category === 'string' &&
           typeof response.difficulty === 'string' &&
           typeof response.language === 'string' &&
           typeof response.wordCount === 'number' &&
           typeof response.estimatedTime === 'number';
  }

  async resetPractice(): Promise<void> {
    // Set restarting state
    this.isRestarting = true;
    
    // Reset all state
    this.currentText = null;
    this.completedSession = null;
    this.showResults = false;
    this.hasStarted = false;
    this.isOfflineMode = false;
    this.typingService.resetSession();
    
    // Show notification
    this.notificationService.info('Fetching new practice text...', 'Restarting', { duration: 2000 });
    
    try {
      // Fetch new text with same configuration
      await this.fetchPracticeText();
    } finally {
      this.isRestarting = false;
    }
  }

  pauseSession(): void {
    this.typingService.pauseSession();
  }

  resumeSession(): void {
    this.typingService.resumeSession();
  }

  restartSession(): void {
    this.typingService.resetSession();
    this.hasStarted = false;
  }

  onSessionStart(): void {
    this.hasStarted = true;
    this.sessionStartTime = Date.now();
  }

  onSessionComplete(session: TypingSession): void {
    this.completedSession = session;
    this.showResults = true;
    
    // Show success notification
    this.notificationService.success(
      `Great job! You completed ${session.totalWords} words with ${session.wpm} WPM and ${session.accuracy}% accuracy.`,
      'Practice Complete!',
      { duration: 4000 }
    );
    
    // Save session to backend (only if not in offline mode)
    if (!this.isOfflineMode) {
      this.apiService.saveTypingSession(session).subscribe({
        next: (savedSession) => {
          console.log('Session saved successfully:', savedSession);
         // this.notificationService.success('Session saved successfully!', 'Saved', { duration: 2000 });
        },
        error: (error) => {
          console.error('Failed to save session:', error);
          //this.notificationService.warning('Session saved locally. Will sync when connection is restored.', 'Offline Save', { duration: 3000 });
          // Store locally for later sync if needed
          this.apiService.saveOfflineSession(session);
        }
      });
    } else {
      // Store locally when in offline mode
      this.apiService.saveOfflineSession(session);
      //this.notificationService.info('Session stored locally (offline mode)', 'Offline Mode', { duration: 2000 });
      console.log('Session stored locally (offline mode)');
    }
  }

  closeResults(): void {
    this.showResults = false;
  }

  async startNewPractice(): Promise<void> {
    this.closeResults();
    await this.resetPractice();
  }

  viewHistory(): void {
    // Navigate to history page (to be implemented)
    console.log('Navigate to history');
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatTimeRemaining(): string {
    if (!this.selectedTimeLimit || !this.sessionStartTime) {
      return '';
    }
    
    const elapsed = (Date.now() - this.sessionStartTime) / 1000;
    const remaining = (this.selectedTimeLimit * 60) - elapsed;
    
    if (remaining <= 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getDefaultText(): TypingText {
    const allTexts = (defaultTypingTexts as any).typingTexts as TypingText[];
    
    // Filter texts by difficulty and category
    let filteredTexts = allTexts.filter(text => 
      text.difficulty === this.selectedDifficulty && 
      text.category === this.selectedCategory
    );
    
    // If no texts match both criteria, filter by difficulty only
    if (filteredTexts.length === 0) {
      filteredTexts = allTexts.filter(text => text.difficulty === this.selectedDifficulty);
    }
    
    // If still no texts, use any text
    if (filteredTexts.length === 0) {
      filteredTexts = allTexts;
    }
    
    // Select a random text
    const randomIndex = Math.floor(Math.random() * filteredTexts.length);
    const selectedText = filteredTexts[randomIndex];
    
    console.log('Selected default text:', selectedText.id, selectedText.category, selectedText.difficulty);
    
    return selectedText;
  }

  // Start the typing session when Enter is pressed
  startTypingSession(): void {
    if (!this.isTyping && !this.hasStarted && this.currentText) {
      console.log('Starting typing session...', {
        currentText: this.currentText.id,
        difficulty: this.selectedDifficulty,
        wordCount: this.currentText.wordCount
      });
      
      this.hasStarted = true;
      this.sessionStartTime = Date.now();
      this.typingService.startSession(this.currentText, 'practice', this.selectedDifficulty as 'easy' | 'medium' | 'hard' | 'expert');
      
      // Show start notification
      this.notificationService.info(
        `Starting ${this.selectedDifficulty} practice with ${this.currentText.wordCount} words`,
        'Session Started',
        { duration: 2000 }
      );
      
      // Force change detection to ensure state is updated
      this.cdr.detectChanges();
    } else {
      console.warn('Cannot start session', {
        isTyping: this.isTyping,
        hasStarted: this.hasStarted,
        hasCurrentText: !!this.currentText
      });
    }
  }

  // Global keydown listener for additional controls (optional)
  @HostListener('document:keydown', ['$event'])
  handleGlobalKey(event: KeyboardEvent) {
    // Handle global shortcuts if needed
    if (event.key === 'Escape' && this.isTyping) {
      this.pauseSession();
    }
  }
} 