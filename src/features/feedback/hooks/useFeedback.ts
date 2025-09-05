import { useState, useCallback, useEffect } from 'react';
import { Feedback } from '../../../shared/types';
import { localStorageService } from '../../../shared/services/localStorage';
import { getApiUrl } from '../../../shared/services/apiConfig';

interface UseFeedbackReturn {
  feedback: Feedback[];
  loading: boolean;
  error: string | null;
  createFeedback: (profileId: string, feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteFeedback: (feedbackId: string) => Promise<void>;
  refreshFeedback: (profileId: string) => Promise<void>;
}

export const useFeedback = (): UseFeedbackReturn => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load feedback from localStorage on mount
  useEffect(() => {
    if (localStorageService.isAvailable()) {
      // Check for and clear any stale feedback data first
      localStorageService.clearStaleFeedback();
      
      const storedFeedback = localStorageService.loadFeedback();
      setFeedback(storedFeedback);

    }
  }, []);

  const refreshFeedback = useCallback(async (profileId: string) => {
    try {

      setLoading(true);
      setError(null);
      
      // First, try to load from localStorage for immediate response
      if (localStorageService.isAvailable()) {
        const localFeedback = localStorageService.getFeedbackForProfile(profileId);
        setFeedback(localFeedback);

      }
      
      // Then try to fetch from API for latest data
      try {
        const url = getApiUrl(`/api/feedback/profiles/${profileId}`);

        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        
        if (response.ok) {
          const result = await response.json();

          const apiFeedback = result.data || [];
          
          // Update localStorage with fresh data
          if (localStorageService.isAvailable()) {
            const allFeedback = localStorageService.loadFeedback();
            const otherFeedback = allFeedback.filter(f => f.toUserId !== profileId);
            const updatedFeedback = [...apiFeedback, ...otherFeedback];
            localStorageService.saveFeedback(updatedFeedback);

          }
          
          setFeedback(apiFeedback);

        } else {

        }
      } catch (apiError) {

        // Continue using localStorage data
      }
    } catch (err) {
      console.error('❌ Error in refreshFeedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFeedback = useCallback(async (profileId: string, feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Optimistic update
    const optimisticFeedback: Feedback = {
      ...feedbackData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {

      setError(null);
      

      setFeedback(prev => [optimisticFeedback, ...prev]);

      // Save to localStorage immediately for offline support
      if (localStorageService.isAvailable()) {
        localStorageService.addFeedback(optimisticFeedback);

      }

      try {
        const response = await fetch(getApiUrl(`/api/feedback/profiles/${profileId}`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });


        
        if (response.ok) {
          const result = await response.json();

          
          // Replace optimistic feedback with real one
          const realFeedback = result.data as Feedback;
          if (realFeedback) {
            setFeedback(prev => prev.map(f => 
              f.id === optimisticFeedback.id ? realFeedback : f
            ));
          }
          
          // Update localStorage with real feedback
          if (localStorageService.isAvailable()) {
            localStorageService.updateFeedback(realFeedback);

          }
          

        } else {
          throw new Error('Failed to create feedback');
        }
      } catch (apiError) {

        // Keep the optimistic feedback in localStorage for offline support
        // The user will see their feedback immediately, and it will sync when online
      }
    } catch (err) {
      console.error('❌ Error in createFeedback:', err);
      // Remove optimistic feedback on error
      setFeedback(prev => prev.filter(f => !f.id.startsWith('temp-')));
      if (localStorageService.isAvailable()) {
        localStorageService.removeFeedback(optimisticFeedback.id);
      }
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
    }
  }, []);

  const deleteFeedback = useCallback(async (feedbackId: string) => {
    try {
      setError(null);
      
      // Optimistic update
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
      
      // Remove from localStorage immediately
      if (localStorageService.isAvailable()) {
        localStorageService.removeFeedback(feedbackId);

      }

      try {
        const response = await fetch(getApiUrl(`/api/feedback/${feedbackId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete feedback');
        }
        

      } catch (apiError) {

        // Keep the optimistic update since we removed from localStorage
      }
    } catch (err) {
      console.error('❌ Error in deleteFeedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete feedback');
    }
  }, []);

  return {
    feedback,
    loading,
    error,
    createFeedback,
    deleteFeedback,
    refreshFeedback,
  };
};
