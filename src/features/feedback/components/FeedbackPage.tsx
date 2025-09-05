import React, { useState, useEffect } from 'react';
import { FeedbackForm, FeedbackList, useFeedback } from '../index';
import { UserRole } from '../../../shared/types';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Plus, X, Users, MessageSquare } from 'lucide-react';

interface FeedbackPageProps {
  profileId: string;
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  profileId,
  currentUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const { feedback, loading, error, createFeedback, deleteFeedback, refreshFeedback } = useFeedback();

  useEffect(() => {
    refreshFeedback(profileId);
  }, [profileId, refreshFeedback]);

  const handleSubmitFeedback = async (feedbackData: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    content: string;
    enhancedContent?: string;
    isEnhanced: boolean;
  }) => {
    await createFeedback(profileId, feedbackData);
    setShowForm(false);
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    await deleteFeedback(feedbackId);
  };

  // Only co-workers and employees can leave feedback from this page
  // Managers should leave feedback directly on profile pages
  const canLeaveFeedback = currentUser.role === UserRole.COWORKER || currentUser.role === UserRole.EMPLOYEE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback & Recognition</h2>
          <p className="text-gray-600 mt-1">
            {currentUser.role === UserRole.MANAGER ? (
              <span className="flex items-center space-x-2">
                <span>Manager view - You can see all feedback across the organization</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Share constructive feedback and recognize your colleagues' contributions</span>
              </span>
            )}
          </p>
        </div>
        
        {canLeaveFeedback && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Leave Feedback</span>
          </Button>
        )}
      </div>

      {/* Feedback Form - Only for co-workers and employees */}
      {showForm && canLeaveFeedback && (
        <Card className="relative">
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <FeedbackForm
            profileId={profileId}
            currentUser={currentUser}
            onSubmit={handleSubmitFeedback}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Feedback List */}
      <FeedbackList
        feedback={feedback}
        loading={loading}
        error={error}
        currentUser={currentUser}
        onDelete={handleDeleteFeedback}
        showEnhanced={true}
      />

      {/* Empty State with CTA - Only for co-workers and employees */}
      {!loading && !error && feedback.length === 0 && canLeaveFeedback && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start the Conversation</h3>
          <p className="text-gray-600 mb-4">
            Be the first to share feedback and help create a culture of continuous improvement.
          </p>
          <Button onClick={() => setShowForm(true)}>
            Leave First Feedback
          </Button>
        </Card>
      )}

      {/* Empty State for Managers - No CTA */}
      {!loading && !error && feedback.length === 0 && !canLeaveFeedback && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
          <p className="text-gray-600">
            When feedback is shared for this profile, it will appear here.
          </p>
        </Card>
      )}
    </div>
  );
};
