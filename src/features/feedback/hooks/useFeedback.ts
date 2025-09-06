import { useState, useCallback } from 'react';
import { Feedback } from '../../../shared/types';
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


  const refreshFeedback = useCallback(async (profileId: string) => {
    setLoading(true);
    setError(null);
    
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
        setFeedback(apiFeedback);
      } else {
        throw new Error('Failed to fetch feedback');
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
    
    setError(null);
    setFeedback(prev => [optimisticFeedback, ...prev]);

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
        const realFeedback = result.data as Feedback;
        if (realFeedback) {
          setFeedback(prev => prev.map(f => 
            f.id === optimisticFeedback.id ? realFeedback : f
          ));
        }
      } else {
        throw new Error('Failed to create feedback');
      }
    } catch (err) {
      console.error('❌ Error in createFeedback:', err);
      // Remove optimistic feedback on error
      setFeedback(prev => prev.filter(f => !f.id.startsWith('temp-')));
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
    }
  }, []);

  const deleteFeedback = useCallback(async (feedbackId: string) => {
    setError(null);
    
    // Optimistic update
    setFeedback(prev => prev.filter(f => f.id !== feedbackId));

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
