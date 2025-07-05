import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypingText, TypingProgress, TypingError } from '../../interfaces/typing.interface';
import { TypingService } from '../../services/typing.service';
import { Subscription } from 'rxjs';
import { OnScreenKeyboardComponent } from '../on-screen-keyboard/on-screen-keyboard.component';

@Component({
  selector: 'app-typing-display',
  standalone: true,
  imports: [CommonModule, OnScreenKeyboardComponent],
  templateUrl: './typing-display.component.html',
  styleUrls: ['./typing-display.component.scss']
})
export class TypingDisplayComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() text: TypingText | null = null;
  @Input() showStats: boolean = true;
  @Input() autoFocus: boolean = true;
  @Input() autoStart: boolean = false; // New input to control auto-start
  @Output() sessionComplete = new EventEmitter<any>();
  @Output() sessionStart = new EventEmitter<void>();

  @ViewChild('typingInput') typingInput!: ElementRef<HTMLInputElement>;
  @ViewChild('typingContainer') typingContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollingTextLine') scrollingTextLine!: ElementRef<HTMLDivElement>;

  words: string[] = [];
  progress: TypingProgress | null = null;
  isTyping: boolean = false;
  isFocused: boolean = false;
  wpm: number = 0;
  accuracy: number = 100;
  errors: TypingError[] = [];
  cursorPosition: number = 0;
  visibleWords: string[] = [];

  private subscriptions: Subscription[] = [];
  private keyPressAudio = new Audio('assets/sounds/key-press.wav');
  private keyErrorAudio = new Audio('assets/sounds/key-error.wav');

  constructor(private typingService: TypingService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.typingService.typingProgress$.subscribe(progress => {
        this.progress = progress;
        this.updateCursorPosition();
        this.updateVisibleWords();
        setTimeout(() => this.scrollToCurrentChar(), 0);
      }),
      this.typingService.wpm$.subscribe(wpm => this.wpm = wpm),
      this.typingService.accuracy$.subscribe(accuracy => this.accuracy = accuracy),
      this.typingService.errors$.subscribe(errors => this.errors = errors),
      this.typingService.isTyping$.subscribe(isTyping => this.isTyping = isTyping)
    );

    this.updateWords();
    this.updateVisibleWords();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] && changes['text'].currentValue) {
      this.updateWords();
      // Only auto-start if explicitly enabled
      if (this.autoStart) {
        this.startSession();
      }
      setTimeout(() => this.focusInput(), 100);
      setTimeout(() => this.scrollToCurrentChar(), 200);
    }
  }

  private updateWords(): void {
    if (this.text && this.text.words) {
      this.words = this.text.words;
      this.updateVisibleWords();
      console.log('Words updated:', this.words.length, 'words loaded');
    } else if (this.text && this.text.text) {
      // Fallback: split text into words if words array is not available
      this.words = this.text.text.split(/\s+/).filter(word => word.length > 0);
      this.updateVisibleWords();
      console.log('Words created from text:', this.words.length, 'words');
    } else {
      this.words = [];
      this.visibleWords = [];
      console.log('No text available');
    }
  }

  ngAfterViewInit(): void {
    if (this.autoFocus) {
      setTimeout(() => this.focusInput(), 100);
    }
    this.scrollToCurrentChar();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if (this.isFocused && this.isTyping) {
      // Handle special keys
      if (event.key === 'Escape') {
        this.pauseSession();
      } else if (event.key === 'F1') {
        event.preventDefault();
        this.restartSession();
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const key = event.key;
    
    // If session hasn't started yet, emit start event for Enter key press
    if (!this.isTyping) {
      if (key === 'Enter') {
        event.preventDefault();
        this.sessionStart.emit();
        // Add a small delay to ensure session is properly initialized
        setTimeout(() => {
          this.focusInput();
        }, 100);
        return;
      }
      return;
    }

    // Session is active, handle typing
    if (!this.progress) {
      console.warn('No progress available for typing');
      return;
    }
    
    if (!this.isTyping) {
      console.warn('Session not in typing mode');
      return;
    }
    
    // Handle special keys
    if (key === 'Backspace') {
      event.preventDefault();
      this.handleBackspace();
      return;
    }

    if (key === 'Enter' || key === 'Tab') {
      event.preventDefault();
      return;
    }

    // Handle space key specifically
    if (key === ' ') {
      event.preventDefault();
      this.handleSpace();
      return;
    }

    // Handle regular characters
    if (key.length === 1) {
      event.preventDefault();
      this.handleCharacter(key);
    }
  }

  private handleCharacter(key: string): void {
    if (!this.progress) {
      console.warn('No progress available for character handling');
      return;
    }

    if (!this.words || this.words.length === 0) {
      console.warn('No words available for typing');
      return;
    }

    const currentWord = this.words[this.progress.currentWordIndex];
    if (!currentWord) {
      console.warn('No current word available', { 
        wordIndex: this.progress.currentWordIndex, 
        wordsLength: this.words.length 
      });
      return;
    }

    const expectedChar = currentWord[this.progress.currentCharIndex];
    if (!expectedChar) {
      console.warn('No expected character available', {
        wordIndex: this.progress.currentWordIndex,
        charIndex: this.progress.currentCharIndex,
        currentWord: currentWord,
        currentWordLength: currentWord.length
      });
      return;
    }

    console.log(`Typing: key="${key}", expected="${expectedChar}", wordIndex=${this.progress.currentWordIndex}, charIndex=${this.progress.currentCharIndex}`);

    // Play sound
    this.playKeySound(key, expectedChar);

    this.typingService.handleKeyPress(key, expectedChar, this.progress.currentWordIndex, this.progress.currentCharIndex);

    // Check if session is complete
    if (this.progress.currentWordIndex >= this.words.length - 1 && 
        this.progress.currentCharIndex >= currentWord.length - 1) {
      this.completeSession();
    }
  }

  private handleSpace(): void {
    if (!this.progress) return;

    const currentWord = this.words[this.progress.currentWordIndex];
    if (!currentWord) return;

    // If we're at the end of the current word, move to next word
    if (this.progress.currentCharIndex >= currentWord.length) {
      // Play sound for correct space
      this.keyPressAudio.currentTime = 0;
      this.keyPressAudio.play();
      
      // Move to next word
      this.typingService.handleKeyPress(' ', ' ', this.progress.currentWordIndex, this.progress.currentCharIndex);
    } else {
      // Play error sound for incorrect space
      this.keyErrorAudio.currentTime = 0;
      this.keyErrorAudio.play();
      
      // Still move forward but mark as error
      this.typingService.handleKeyPress(' ', currentWord[this.progress.currentCharIndex], this.progress.currentWordIndex, this.progress.currentCharIndex);
    }
  }

  private playKeySound(key: string, expectedChar: string) {
    if (key === expectedChar) {
      this.keyPressAudio.currentTime = 0;
      this.keyPressAudio.play();
    } else {
      this.keyErrorAudio.currentTime = 0;
      this.keyErrorAudio.play();
    }
  }

  private handleBackspace(): void {
    if (!this.progress) return;

    if (this.progress.currentCharIndex > 0) {
      this.progress.currentCharIndex--;
    } else if (this.progress.currentWordIndex > 0) {
      this.progress.currentWordIndex--;
      this.progress.currentCharIndex = this.words[this.progress.currentWordIndex].length - 1;
    }

    this.typingService['typingProgressSubject'].next(this.progress);
  }

  private completeSession(): void {
    const session = this.typingService.completeSession();
    if (session) {
      this.sessionComplete.emit(session);
    }
  }

  private updateCursorPosition(): void {
    if (!this.progress || !this.typingContainer) return;

    // Calculate cursor position based on current word and character
    let position = 0;
    
    // Add width of completed words
    for (let i = 0; i < this.progress.currentWordIndex; i++) {
      const wordElement = this.typingContainer.nativeElement.querySelector(`.word:nth-child(${i + 1})`);
      if (wordElement) {
        position += wordElement.getBoundingClientRect().width;
      }
      // Add space width
      position += 8; // Approximate space width
    }

    // Add width of current word characters
    const currentWord = this.words[this.progress.currentWordIndex];
    if (currentWord) {
      for (let i = 0; i < this.progress.currentCharIndex; i++) {
        position += 8; // Approximate character width
      }
    }

    this.cursorPosition = position;
  }

  focusInput(): void {
    if (this.typingInput) {
      this.typingInput.nativeElement.focus();
    }
  }

  onFocus(): void {
    this.isFocused = true;
    // Do not auto-start session here; parent will control when to start
  }

  onBlur(): void {
    this.isFocused = false;
  }

  startSession(): void {
    if (this.text) {
      this.typingService.startSession(this.text);
      this.sessionStart.emit();
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
    this.startSession();
  }

  // Character state methods
  isCharCompleted(wordIndex: number, charIndex: number): boolean {
    return this.progress ? 
      wordIndex < this.progress.currentWordIndex || 
      (wordIndex === this.progress.currentWordIndex && charIndex < this.progress.currentCharIndex) : false;
  }

  isCurrentChar(wordIndex: number, charIndex: number): boolean {
    return this.progress ? 
      wordIndex === this.progress.currentWordIndex && charIndex === this.progress.currentCharIndex : false;
  }

  isCurrentSpace(wordIndex: number): boolean {
    return this.progress ? 
      wordIndex === this.progress.currentWordIndex && this.progress.currentCharIndex >= this.words[wordIndex].length : false;
  }

  isCharError(wordIndex: number, charIndex: number): boolean {
    const position = this.getAbsolutePosition(wordIndex, charIndex);
    return this.errors.some(error => error.position === position);
  }

  isCharCorrect(wordIndex: number, charIndex: number): boolean {
    return this.isCharCompleted(wordIndex, charIndex) && !this.isCharError(wordIndex, charIndex);
  }

  hasWordError(wordIndex: number): boolean {
    const wordStart = this.getAbsolutePosition(wordIndex, 0);
    const wordEnd = this.getAbsolutePosition(wordIndex, this.words[wordIndex].length);
    return this.errors.some(error => error.position >= wordStart && error.position < wordEnd);
  }

  private getAbsolutePosition(wordIndex: number, charIndex: number): number {
    let position = 0;
    for (let i = 0; i < wordIndex; i++) {
      position += this.words[i].length + 1; // +1 for space
    }
    return position + charIndex;
  }

  get currentChar(): string {
    if (!this.progress || !this.words.length) return '';
    const word = this.words[this.progress.currentWordIndex];
    if (!word) return '';
    return word[this.progress.currentCharIndex] || '';
  }

  private scrollToCurrentChar(): void {
    if (!this.scrollingTextLine || !this.progress) return;
    const charSpans = this.scrollingTextLine.nativeElement.querySelectorAll('span');
    let charIndex = 0;
    for (let w = 0; w < this.progress.currentWordIndex; w++) {
      charIndex += this.words[w].length + 1; // +1 for space
    }
    charIndex += this.progress.currentCharIndex;
    const currentCharSpan = charSpans[charIndex] as HTMLElement;
    if (currentCharSpan) {
      const container = this.scrollingTextLine.nativeElement;
      const charLeft = currentCharSpan.offsetLeft;
      const charWidth = currentCharSpan.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollTarget = charLeft - containerWidth / 2 + charWidth / 2;
      container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }

  private updateVisibleWords(): void {
    if (!this.progress || !this.words.length) {
      this.visibleWords = [];
      return;
    }
    const start = this.progress.currentWordIndex;
    const end = Math.min(start + 4, this.words.length); // current + next 3
    this.visibleWords = this.words.slice(start, end);
  }
} 