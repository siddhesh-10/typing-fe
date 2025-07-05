import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-practice-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './practice-settings.component.html',
  styleUrls: ['./practice-settings.component.scss']
})
export class PracticeSettingsComponent {
  selectedDifficulty = 'medium';
  selectedCategory = 'general';
  selectedTimeLimit: number | null = null;

  difficulties = [
    { value: 'easy', name: 'Easy', description: 'Simple words, short sentences', icon: '😊' },
    { value: 'medium', name: 'Medium', description: 'Standard vocabulary and length', icon: '😐' },
    { value: 'hard', name: 'Hard', description: 'Complex words and sentences', icon: '😰' },
    { value: 'expert', name: 'Expert', description: 'Advanced vocabulary, technical terms', icon: '🤯' }
  ];

  categories = [
    { value: 'general', name: 'General', icon: '📚' },
    { value: 'technology', name: 'Technology', icon: '💻' },
    { value: 'literature', name: 'Literature', icon: '📖' },
    { value: 'news', name: 'News', icon: '📰' },
    { value: 'quotes', name: 'Quotes', icon: '💬' },
    { value: 'code', name: 'Code', icon: '🔧' },
  ];

  timeLimits = [
    { value: null, label: 'No Limit' },
    { value: 1, label: '1 Minute' },
    { value: 2, label: '2 Minutes' },
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' }
  ];

  isLoading = false;

  constructor(private router: Router) {}

  selectDifficulty(difficulty: string): void {
    this.selectedDifficulty = difficulty;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  selectTimeLimit(timeLimit: number | null): void {
    this.selectedTimeLimit = timeLimit;
  }

  startPractice(): void {
    this.isLoading = true;
    // Navigate to the typing session page with config as query params
    this.router.navigate(['/practice/session'], {
      queryParams: {
        difficulty: this.selectedDifficulty,
        category: this.selectedCategory,
        time: this.selectedTimeLimit
      }
    });
  }
} 