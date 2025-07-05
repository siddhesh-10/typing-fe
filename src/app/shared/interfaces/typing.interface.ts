export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  country: string;
  joinDate: Date;
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  totalAccuracy: number;
  rank?: number;
  isOnline: boolean;
  lastActive: Date;
}

export interface TypingSession {
  id: string;
  userId?: string;
  text: string;
  words: string[];
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  wpm: number;
  accuracy: number;
  errors: number;
  totalWords: number;
  completedWords: number;
  isCompleted: boolean;
  mode: 'practice' | 'challenge' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
}

export interface TypingStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  totalWordsTyped: number;
  totalTimeTyping: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  rank: number;
  percentile: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  wpm: number;
  accuracy: number;
  date: Date;
  mode: 'practice' | 'challenge' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface Challenge {
  id: string;
  challenger: User;
  opponent: User;
  status: 'pending' | 'accepted' | 'declined' | 'in-progress' | 'completed';
  text: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number; // in minutes
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  winner?: User;
  challengerResult?: TypingSession;
  opponentResult?: TypingSession;
}

export interface AIPracticeSession {
  id: string;
  userId: string;
  aiLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  text: string;
  startTime: Date;
  endTime?: Date;
  userResult?: TypingSession;
  aiResult?: TypingSession;
  aiWpm: number;
  aiAccuracy: number;
  userWpm: number;
  userAccuracy: number;
  winner?: 'user' | 'ai' | 'tie';
}

export interface TypingText {
  id: string;
  text: string;
  words: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  language: string;
  source?: string;
  wordCount: number;
  estimatedTime: number; // in minutes
}

export interface CountryLeaderboard {
  country: string;
  entries: LeaderboardEntry[];
  totalUsers: number;
  averageWpm: number;
}

export interface GlobalLeaderboard {
  entries: LeaderboardEntry[];
  totalUsers: number;
  averageWpm: number;
  lastUpdated: Date;
}

export interface TypingError {
  position: number;
  expected: string;
  actual: string;
  timestamp: Date;
}

export interface TypingProgress {
  currentWordIndex: number;
  currentCharIndex: number;
  completedWords: number;
  errors: TypingError[];
  startTime: Date;
  isActive: boolean;
} 