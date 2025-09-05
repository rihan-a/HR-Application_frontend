/**
 * Configuration service for fetching app constants from backend
 */
import { getApiUrl } from './apiConfig';

export interface AppConfig {
  annualVacationDays: number;
  maxAbsenceReasonLength: number;
  maxAdvanceBookingYears: number;
}

let cachedConfig: AppConfig | null = null;

/**
 * Fetch application configuration from backend
 * Uses caching to avoid repeated API calls
 */
export const getAppConfig = async (): Promise<AppConfig> => {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch(getApiUrl('/api/config'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch app configuration');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      cachedConfig = result.data;
      return result.data;
    } else {
      throw new Error('Invalid configuration response');
    }
  } catch (error) {
    console.error('Error fetching app config:', error);
    
    // Fallback to default values if API fails
    const fallbackConfig: AppConfig = {
      annualVacationDays: 26,
      maxAbsenceReasonLength: 500,
      maxAdvanceBookingYears: 1
    };
    
    cachedConfig = fallbackConfig;
    return fallbackConfig;
  }
};

/**
 * Clear cached configuration (useful for testing or when config might change)
 */
export const clearConfigCache = (): void => {
  cachedConfig = null;
};
