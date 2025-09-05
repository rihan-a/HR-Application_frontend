import React, { useState } from 'react';
import { Feedback, UserRole } from '../../../shared/types';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Sparkles, Trash2, Eye, EyeOff, MessageCircle } from 'lucide-react';

interface FeedbackItemProps {
  feedback: Feedback;
  currentUser: {
    id: string;
    role: UserRole;
  };
  onDelete?: (feedbackId: string) => Promise<void>;
  showEnhanced?: boolean;
}

export const FeedbackItem: React.FC<FeedbackItemProps> = ({
  feedback,
  currentUser,
  onDelete,
  showEnhanced = true
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = currentUser.role === UserRole.MANAGER || 
                   (currentUser.role === UserRole.EMPLOYEE && feedback.fromUserId === currentUser.id);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      setIsDeleting(true);
      try {
        await onDelete(feedback.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasEnhancement = feedback.isEnhanced && feedback.enhancedContent && 
                         feedback.enhancedContent !== feedback.content;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-900 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-white">{feedback.fromUserName}</p>
            <p className="text-sm text-gray-400">{formatDate(feedback.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {feedback.isEnhanced && (
            <Badge variant="info" className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Enhanced</span>
            </Badge>
          )}
          
          {canDelete && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-900"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Enhanced Content (shown by default) */}
        {showEnhanced && hasEnhancement && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-200 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                <span>AI Enhanced Feedback</span>
              </h4>
              
              {/* Small toggle button to show/hide original */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs px-2 py-1 h-6"
              >
                {showOriginal ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    <span>Hide Original</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    <span>Show Original</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-blue-200 leading-relaxed">
              {feedback.enhancedContent}
            </div>
            
            {/* Original content (hidden by default, shown on toggle) */}
            {showOriginal && (
              <div className="mt-3 pt-3 border-t border-blue-600">
                <h5 className="text-xs font-medium text-gray-300 mb-2">Original Feedback:</h5>
                <div className="bg-gray-800 p-3 rounded border text-sm text-gray-300 italic">
                  {feedback.content}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  💡 This demonstrates the AI enhancement process
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fallback: Show original content if no enhancement */}
        {(!showEnhanced || !hasEnhancement) && (
          <div>
            <p className="text-gray-200 leading-relaxed">{feedback.content}</p>
          </div>
        )}

        {/* Last Updated Info */}
        {feedback.updatedAt !== feedback.createdAt && (
          <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
            Last updated: {formatDate(feedback.updatedAt)}
          </div>
        )}
      </div>
    </Card>
  );
};
