import { Feedback } from '../types';

const FEEDBACK_STORAGE_KEY = 'newwork_feedback_data';
const FEEDBACK_METADATA_KEY = 'newwork_feedback_metadata';

interface FeedbackMetadata {
  lastSync: string;
  version: string;
  totalCount: number;
}

export class LocalStorageService {
  private static instance: LocalStorageService;

  private constructor() {}

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // Save all feedback to localStorage
  saveFeedback(feedback: Feedback[]): void {
    try {
      const metadata: FeedbackMetadata = {
        lastSync: new Date().toISOString(),
        version: '1.0.0',
        totalCount: feedback.length
      };

      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
      localStorage.setItem(FEEDBACK_METADATA_KEY, JSON.stringify(metadata));
      

    } catch (error) {
      console.error('❌ Failed to save feedback to localStorage:', error);
    }
  }

  // Load all feedback from localStorage
  loadFeedback(): Feedback[] {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (!stored) {

        return [];
      }

      const feedback = JSON.parse(stored) as Feedback[];

      return feedback;
    } catch (error) {
      console.error('❌ Failed to load feedback from localStorage:', error);
      return [];
    }
  }

  // Add a single feedback item
  addFeedback(feedback: Feedback): void {
    try {
      const existing = this.loadFeedback();
      const updated = [feedback, ...existing];
      this.saveFeedback(updated);

    } catch (error) {
      console.error('❌ Failed to add feedback to localStorage:', error);
    }
  }

  // Update a single feedback item
  updateFeedback(updatedFeedback: Feedback): void {
    try {
      const existing = this.loadFeedback();
      const updated = existing.map(f => 
        f.id === updatedFeedback.id ? updatedFeedback : f
      );
      this.saveFeedback(updated);

    } catch (error) {
      console.error('❌ Failed to update feedback in localStorage:', error);
    }
  }

  // Remove a single feedback item
  removeFeedback(feedbackId: string): void {
    try {
      const existing = this.loadFeedback();
      const updated = existing.filter(f => f.id !== feedbackId);
      this.saveFeedback(updated);

    } catch (error) {
      console.error('❌ Failed to remove feedback from localStorage:', error);
    }
  }

  // Get feedback for a specific profile
  getFeedbackForProfile(profileId: string): Feedback[] {
    const allFeedback = this.loadFeedback();
    return allFeedback.filter(f => f.toUserId === profileId);
  }

  // Get feedback received by a specific user
  getFeedbackReceivedByUser(userId: string): Feedback[] {
    const allFeedback = this.loadFeedback();
    return allFeedback.filter(f => f.toUserId === userId);
  }

  // Get feedback written by a specific user
  getFeedbackWrittenByUser(userId: string): Feedback[] {
    const allFeedback = this.loadFeedback();
    return allFeedback.filter(f => f.fromUserId === userId);
  }

  // Clear all feedback data
  clearFeedback(): void {
    try {
      localStorage.removeItem(FEEDBACK_STORAGE_KEY);
      localStorage.removeItem(FEEDBACK_METADATA_KEY);

    } catch (error) {
      console.error('❌ Failed to clear feedback from localStorage:', error);
    }
  }

  // Clear stale or corrupted feedback data (for debugging)
  clearStaleFeedback(): void {
    try {
      const metadata = this.getMetadata();
      const allFeedback = this.loadFeedback();
      

      
      // If there's a mismatch or suspiciously high count, clear the data
      if (allFeedback.length > 50 || (metadata && Math.abs(allFeedback.length - metadata.totalCount) > 5)) {
        this.clearFeedback();
      }
    } catch (error) {
      console.error('❌ Failed to check for stale feedback:', error);
      // If there's an error checking, clear everything to be safe
      this.clearFeedback();
    }
  }

  // Get storage metadata
  getMetadata(): FeedbackMetadata | null {
    try {
      const stored = localStorage.getItem(FEEDBACK_METADATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Failed to load feedback metadata:', error);
      return null;
    }
  }

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export const localStorageService = LocalStorageService.getInstance();
