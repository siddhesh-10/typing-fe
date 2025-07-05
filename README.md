# TypeMaster - Advanced Typing Practice Platform

A modern, production-ready typing practice application built with Angular 18, featuring AI-powered practice, real-time competitions, global leaderboards, and more.

## 🚀 Features

### Core Features
- **Typing Practice**: Customizable practice sessions with different difficulty levels and text categories
- **Real-time Statistics**: Live WPM, accuracy, and error tracking
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Cross-platform**: Works on desktop, tablet, and mobile devices

### Advanced Features (Coming Soon)
- **AI Practice**: Practice against intelligent AI opponents that adapt to your skill level
- **1v1 Challenges**: Real-time typing battles with other players
- **Global Leaderboards**: Compete on global and country-wide rankings
- **User Profiles**: Detailed statistics and progress tracking
- **Authentication**: Secure user registration and login with AWS Cognito

## 🛠️ Technology Stack

- **Frontend**: Angular 18 with TypeScript
- **Styling**: SCSS with modern CSS features
- **State Management**: RxJS with BehaviorSubjects
- **Authentication**: AWS Cognito (planned)
- **Backend**: Node.js/Express with AWS services (planned)
- **Database**: DynamoDB (planned)
- **Deployment**: AWS Amplify/CloudFront (planned)

## 📦 Installation & Setup

### Prerequisites
- Node.js v20.19+ or v22.12+
- npm v8.0.0+

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd typing-practice

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Development Commands
```bash
# Start development server with SSR
npm run dev:ssr

# Build for production with SSR
npm run build:ssr

# Serve production build
npm run serve:ssr

# Run tests
npm test

# Run linting
npm run lint
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── features/                 # Feature modules
│   │   ├── home/                # Home page
│   │   ├── practice/            # Typing practice
│   │   ├── leaderboard/         # Leaderboards
│   │   ├── profile/             # User profiles
│   │   ├── challenge/           # 1v1 challenges
│   │   ├── ai-practice/         # AI practice
│   │   └── auth/                # Authentication
│   ├── shared/                  # Shared components & services
│   │   ├── components/          # Reusable components
│   │   │   ├── typing-display/  # Main typing interface
│   │   │   └── not-found/       # 404 page
│   │   ├── services/            # Core services
│   │   │   ├── typing.service.ts
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   ├── interfaces/          # TypeScript interfaces
│   │   ├── models/              # Data models
│   │   ├── directives/          # Custom directives
│   │   └── pipes/               # Custom pipes
│   ├── app.component.ts         # Main app component
│   ├── app.config.ts           # App configuration
│   └── app.routes.ts           # Routing configuration
├── environments/                # Environment configurations
└── styles.scss                 # Global styles
```

## 🔧 Configuration

### Environment Variables
Create environment files for different deployment stages:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'your-user-pool-id',
    clientId: 'your-client-id'
  }
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'your-production-user-pool-id',
    clientId: 'your-production-client-id'
  }
};
```

## 📡 API Specifications

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-api-domain.com/api
```

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Endpoints

#### User Management
```
GET    /user/profile              # Get current user profile
PATCH  /user/profile              # Update user profile
GET    /user/stats                # Get user typing statistics
GET    /user/history              # Get user typing history
```

#### Typing Sessions
```
POST   /sessions                  # Save typing session
GET    /sessions                  # Get typing sessions with filters
POST   /sessions/bulk             # Bulk save sessions (offline sync)
```

#### Typing Texts
```
GET    /texts                     # Get typing texts with filters
GET    /texts/random              # Get random typing text
```

#### Leaderboards
```
GET    /leaderboard/global        # Get global leaderboard
GET    /leaderboard/country/:country  # Get country leaderboard
GET    /leaderboard/mode          # Get leaderboard by mode
```

#### Challenges
```
POST   /challenges                # Create challenge
GET    /challenges                # Get challenges
PATCH  /challenges/:id/accept     # Accept challenge
PATCH  /challenges/:id/decline    # Decline challenge
POST   /challenges/:id/result     # Submit challenge result
```

#### AI Practice
```
POST   /ai-practice               # Start AI practice session
POST   /ai-practice/:id/result    # Submit AI practice result
```

#### User Search
```
GET    /users/search              # Search users
```

#### Analytics
```
GET    /analytics                 # Get analytics data
```

#### Health Check
```
GET    /health                    # Health check endpoint
```

### Request/Response Examples

#### Save Typing Session
```typescript
// Request
POST /api/sessions
{
  "text": "The quick brown fox jumps over the lazy dog.",
  "words": ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"],
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:01:30Z",
  "duration": 90,
  "wpm": 45,
  "accuracy": 98,
  "errors": 2,
  "totalWords": 9,
  "completedWords": 9,
  "isCompleted": true,
  "mode": "practice",
  "difficulty": "medium",
  "category": "general"
}

// Response
{
  "id": "session_123",
  "userId": "user_456",
  "text": "The quick brown fox jumps over the lazy dog.",
  "words": ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"],
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:01:30Z",
  "duration": 90,
  "wpm": 45,
  "accuracy": 98,
  "errors": 2,
  "totalWords": 9,
  "completedWords": 9,
  "isCompleted": true,
  "mode": "practice",
  "difficulty": "medium",
  "category": "general",
  "createdAt": "2024-01-01T10:01:30Z"
}
```

#### Get Global Leaderboard
```typescript
// Request
GET /api/leaderboard/global?limit=100

// Response
{
  "entries": [
    {
      "rank": 1,
      "user": {
        "id": "user_123",
        "username": "typing_master",
        "email": "user@example.com",
        "country": "US",
        "avatar": "https://example.com/avatar.jpg",
        "isOnline": true
      },
      "wpm": 120,
      "accuracy": 99,
      "date": "2024-01-01T10:00:00Z",
      "mode": "practice",
      "difficulty": "expert"
    }
  ],
  "totalUsers": 50000,
  "averageWpm": 65,
  "lastUpdated": "2024-01-01T10:00:00Z"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Blue)
- **Secondary**: #764ba2 (Purple)
- **Success**: #4facfe (Light Blue)
- **Warning**: #43e97b (Green)
- **Error**: #fa709a (Pink)
- **Text Primary**: #2d3748 (Dark Gray)
- **Text Secondary**: #718096 (Medium Gray)
- **Background**: #f7fafc (Light Gray)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace Font**: JetBrains Mono (for typing display)
- **Font Weights**: 300, 400, 500, 600, 700, 800, 900

### Components
The application uses a modular component architecture with:
- Reusable UI components
- Consistent styling patterns
- Responsive design principles
- Accessibility features
- Dark mode support

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# The built files will be in the `dist/` directory
```

### AWS Deployment (Planned)
1. **Frontend**: Deploy to AWS Amplify or CloudFront
2. **Backend**: Deploy to AWS Lambda with API Gateway
3. **Database**: Use DynamoDB for data storage
4. **Authentication**: Configure AWS Cognito
5. **CDN**: Use CloudFront for static assets

### Environment Setup
1. Configure environment variables
2. Set up AWS services
3. Configure CORS settings
4. Set up monitoring and logging

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

### Code Quality
```bash
npm run lint
npm run lint:fix
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic typing practice
- ✅ Real-time statistics
- ✅ Responsive design
- ✅ Component architecture

### Phase 2 (Next)
- 🔄 User authentication
- 🔄 User profiles
- 🔄 Session history
- 🔄 Basic leaderboards

### Phase 3 (Future)
- 📋 AI practice mode
- 📋 1v1 challenges
- 📋 Real-time multiplayer
- 📋 Advanced analytics
- 📋 Mobile app

### Phase 4 (Advanced)
- 📋 Social features
- 📋 Tournaments
- 📋 API for third-party integrations
- 📋 Advanced AI features

---

**Built with ❤️ using Angular 18**
