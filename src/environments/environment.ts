export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'your-user-pool-id',
    clientId: 'your-client-id'
  },
  features: {
    aiPractice: true,
    challenges: true,
    leaderboards: true,
    offlineMode: true
  }
}; 