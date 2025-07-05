import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  features = [
    {
      icon: '🚀',
      title: 'AI-Powered Practice',
      description: 'Practice against intelligent AI opponents that adapt to your skill level'
    },
    {
      icon: '⚔️',
      title: '1v1 Challenges',
      description: 'Challenge friends or random opponents in real-time typing battles'
    },
    {
      icon: '🏆',
      title: 'Global Leaderboards',
      description: 'Compete on global and country-wide leaderboards to prove your skills'
    },
    {
      icon: '📊',
      title: 'Detailed Analytics',
      description: 'Track your progress with comprehensive statistics and insights'
    },
    {
      icon: '🎯',
      title: 'Customizable Practice',
      description: 'Choose from various difficulty levels and text categories'
    },
    {
      icon: '📱',
      title: 'Cross-Platform',
      description: 'Practice anywhere with our responsive web application'
    }
  ];

  stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '1M+', label: 'Tests Completed' },
    { value: '150+', label: 'Countries' },
    { value: '95%', label: 'Satisfaction Rate' }
  ];

  practiceModes = [
    {
      icon: '🎯',
      title: 'Practice Mode',
      description: 'Improve your skills with customizable practice sessions',
      features: ['Multiple difficulties', 'Various categories', 'Progress tracking'],
      buttonText: 'Start Practice',
      route: '/practice'
    },
    {
      icon: '🤖',
      title: 'AI Practice',
      description: 'Challenge AI opponents that adapt to your skill level',
      features: ['Adaptive difficulty', 'Real-time feedback', 'Performance analysis'],
      buttonText: 'Try AI Practice',
      route: '/ai-practice'
    },
    {
      icon: '⚔️',
      title: '1v1 Challenge',
      description: 'Compete against other players in real-time battles',
      features: ['Real-time matches', 'Live leaderboard', 'Chat system'],
      buttonText: 'Find Opponent',
      route: '/challenge'
    }
  ];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.animateStats();
  }

  private animateStats(): void {
    // Animate stats when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    });

    document.querySelectorAll('.stat-number').forEach(el => {
      observer.observe(el);
    });
  }
} 