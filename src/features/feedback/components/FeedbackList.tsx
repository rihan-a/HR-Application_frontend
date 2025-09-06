import React from 'react';
import { Feedback, UserRole } from '../../../shared/types';
import { FeedbackItem } from './FeedbackItem';
import { Card } from '../../../shared/components/ui/Card';
import { LoadingSpinner } from '../../../shared/components/ui';
import { MessageCircle } from 'lucide-react';

interface FeedbackListProps {
  feedback: Feedback[];
  loading: boolean;
  error: string | null;
  currentUser: {
    id: string;
    role: UserRole;
  };
  onDelete?: (feedbackId: string) => Promise<void>;
  showEnhanced?: boolean;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedback,
  loading,
  error,
  currentUser,
  onDelete,
  showEnhanced = true
}) => {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" text="Loading feedback..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-900 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Feedback</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </Card>
    );
  }

  if (feedback.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Feedback Yet</h3>
          <p className="text-gray-300">
            Be the first to share feedback and help improve the workplace!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Feedback ({feedback.length})
        </h3>
        {feedback.some(f => f.isEnhanced) && (
          <div className="text-sm text-gray-400">
            {feedback.filter(f => f.isEnhanced).length} enhanced with AI
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {feedback.map((item) => (
          <FeedbackItem
            key={item.id}
            feedback={item}
            currentUser={currentUser}
            onDelete={onDelete}
            showEnhanced={showEnhanced}
          />
        ))}
      </div>
    </div>
  );
};
