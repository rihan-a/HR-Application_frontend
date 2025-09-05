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
  
  // In production, use the environment variable or fallback
  return import.meta.env.VITE_API_BASE_URL || '';
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
    return normalizedEndpoint;
  }
  
  // Remove trailing slash from baseUrl and ensure endpoint starts with /
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}${normalizedEndpoint}`;
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

// Log environment info in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', getEnvironmentInfo());
}
