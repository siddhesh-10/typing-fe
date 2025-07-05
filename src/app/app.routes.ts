import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Typing Practice - Home'
  },
  {
    path: 'practice',
    loadComponent: () => import('./features/practice/practice-settings.component').then(m => m.PracticeSettingsComponent),
    title: 'Typing Practice Settings'
  },
  {
    path: 'practice/session',
    loadComponent: () => import('./features/practice/practice.component').then(m => m.PracticeComponent),
    title: 'Typing Practice Session'
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
    title: 'Leaderboard'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile'
  },
  {
    path: 'challenge',
    loadComponent: () => import('./features/challenge/challenge.component').then(m => m.ChallengeComponent),
    title: '1v1 Challenge'
  },
  {
    path: 'ai-practice',
    loadComponent: () => import('./features/ai-practice/ai-practice.component').then(m => m.AiPracticeComponent),
    title: 'AI Practice'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'Authentication'
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  }
];
