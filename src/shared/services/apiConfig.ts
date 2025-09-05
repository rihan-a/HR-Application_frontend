/**
 * API Configuration Service
 * Centralized configuration for API endpoints and environment variables
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Get API base URL from environment variable
const getApiBaseUrl = (): string => {
  // In development, use the proxy (relative URL)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, use the environment variable
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // If no environment variable is set, fallback to localhost for testing
  if (!envApiUrl) {
    console.warn('⚠️ VITE_API_BASE_URL not set, falling back to localhost:3001');
    return 'http://localhost:3001';
  }
  
  return envApiUrl;
};

// Get API configuration
export const getApiConfig = (): ApiConfig => {
  return {
    baseUrl: getApiBaseUrl(),
    timeout: 10000, // 10 seconds
    retryAttempts: 3
  };
};

// Get full API URL for a given endpoint
export const getApiUrl = (endpoint: string): string => {
  const config = getApiConfig();
  const baseUrl = config.baseUrl;
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If baseUrl is empty (development with proxy), return relative URL
  if (!baseUrl) {
    console.log('🔗 Using relative URL:', normalizedEndpoint);
    return normalizedEndpoint;
  }
  
  // Remove trailing slash from baseUrl and ensure endpoint starts with /
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const fullUrl = `${cleanBaseUrl}${normalizedEndpoint}`;
  console.log('🔗 Full API URL:', fullUrl);
  return fullUrl;
};

// Environment information
export const getEnvironmentInfo = () => {
  return {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    apiBaseUrl: getApiBaseUrl(),
    appName: import.meta.env.VITE_APP_NAME || 'NewWork Frontend',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
  };
};

// Log environment info in development and production
console.log('🔧 API Configuration:', getEnvironmentInfo());
console.log('🌐 API Base URL:', getApiBaseUrl());

// Test API connectivity
if (import.meta.env.PROD) {
  console.log('🧪 Testing API connectivity...');
  fetch(getApiUrl('/api/config'))
    .then(response => {
      console.log('✅ API is reachable:', response.status);
    })
    .catch(error => {
      console.error('❌ API connection failed:', error);
      console.log('💡 This might be a CORS issue or backend not running');
    });
}
