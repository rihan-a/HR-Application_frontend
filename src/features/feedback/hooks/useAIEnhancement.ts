import { useState, useCallback } from 'react';
import { getApiUrl } from '../../../shared/services/apiConfig';

interface UseAIEnhancementReturn {
  enhancedText: string | null;
  loading: boolean;
  error: string | null;
  enhanceText: (text: string, employeeName?: string) => Promise<string | null>;
  resetEnhancement: () => void;
}

export const useAIEnhancement = (): UseAIEnhancementReturn => {
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceText = useCallback(async (text: string, employeeName?: string): Promise<string | null> => {
    if (!text.trim()) {
      setError('Please enter some text to enhance');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setEnhancedText(null);


      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(getApiUrl('/api/feedback/enhance'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, employeeName }),
      });



      if (!response.ok) {
        let errorMessage = 'Failed to enhance text';
        
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 429) {
          errorMessage = 'Too many enhancement requests. Please wait a moment and try again.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const enhanced = result.data.enhancedText;
      
      setEnhancedText(enhanced);
      return enhanced;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance text';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetEnhancement = useCallback(() => {
    setEnhancedText(null);
    setError(null);
  }, []);

  return {
    enhancedText,
    loading,
    error,
    enhanceText,
    resetEnhancement,
  };
};
