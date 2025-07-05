export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'your-production-user-pool-id',
    clientId: 'your-production-client-id'
  },
  features: {
    aiPractice: true,
    challenges: true,
    leaderboards: true,
    offlineMode: true
  }
}; 