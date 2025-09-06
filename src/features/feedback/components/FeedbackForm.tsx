import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAIEnhancement } from '../hooks/useAIEnhancement';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { LoadingSpinner } from '../../../shared/components/ui';
import { UserRole } from '../../../shared/types';
import { Sparkles, Send, RotateCcw, Info } from 'lucide-react';

interface FeedbackFormProps {
  profileId: string;
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  employeeName?: string; // Add employee name for AI enhancement
  onSubmit: (feedbackData: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    content: string;
    enhancedContent?: string;
    isEnhanced: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
}

interface FeedbackFormData {
  content: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  profileId,
  currentUser,
  employeeName,
  onSubmit,
  onCancel
}) => {
  const [isEnhanced, setIsEnhanced] = useState(false); // Default to not enhanced
  const [showPreview, setShowPreview] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FeedbackFormData>();
  const { enhancedText, loading: aiLoading, error: aiError, enhanceText, resetEnhancement } = useAIEnhancement();
  
  const content = watch('content');

  const handleEnhanceToggle = async () => {
    if (!content?.trim()) {
      return;
    }

    if (isEnhanced && enhancedText) {
      // Already enhanced, just toggle off
      setIsEnhanced(false);
      setShowPreview(false);
      return;
    }

    // Enhance the text with employee name
    const enhanced = await enhanceText(content, employeeName);
    if (enhanced) {
      setIsEnhanced(true);
      setShowPreview(true);
    }
  };

  const handleFormSubmit = async (data: FeedbackFormData) => {
    const feedbackData = {
      fromUserId: currentUser.id,
      fromUserName: `${currentUser.firstName} ${currentUser.lastName}`,
      toUserId: profileId,
      content: data.content,
      enhancedContent: isEnhanced && enhancedText ? enhancedText : data.content,
      isEnhanced: isEnhanced && enhancedText ? true : false
    };

    await onSubmit(feedbackData);
    
    // Reset form
    setValue('content', '');
    setIsEnhanced(false); // Reset to default not enhanced state
    setShowPreview(false);
    resetEnhancement();
  };

  // Allow employees, co-workers, and managers to leave feedback
  const canLeaveFeedback = currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.COWORKER || currentUser.role === UserRole.EMPLOYEE;

  if (!canLeaveFeedback) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center">
          You don't have permission to leave feedback.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Leave Feedback</h3>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            {...register('content', { 
              required: 'Feedback content is required',
              minLength: { value: 10, message: 'Feedback must be at least 10 characters' }
            })}
            id="content"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your thoughts, suggestions, or appreciation..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        {content && content.length >= 10 && (
          <div className="space-y-3">
            {/* AI Enhancement Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  AI Enhancement
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnhanceToggle}
                disabled={aiLoading}
                className="flex items-center space-x-1"
              >
                {aiLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Enhancing...</span>
                  </>
                ) : isEnhanced && enhancedText ? (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-enhance</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Enhance</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Info about AI enhancement */}
            <div className="bg-blue-50 p-3">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">AI Enhancement Benefits:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Makes feedback more constructive and professional</li>
                    <li>• Keeps it concise and natural (2-3 sentences)</li>
                    <li>• Uses the person's actual name</li>
                    <li>• Maintains your core message</li>
                  </ul>
                </div>
              </div>
            </div>
            

          </div>
        )}

        {aiError && (
          <div className="text-red-500 text-sm bg-red-50 p-3">
            {aiError}
          </div>
        )}

        {showPreview && enhancedText && isEnhanced && (
          <div className="bg-green-50 p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Enhanced Preview</span>
            </h4>
            <div className="text-sm text-green-800 bg-white p-3 rounded border">
              {enhancedText}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-green-600">
                ✨ Your feedback has been enhanced for better workplace communication
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  resetEnhancement();
                  setIsEnhanced(false);
                }}
                className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Use Original</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || aiLoading}
            className="flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};
