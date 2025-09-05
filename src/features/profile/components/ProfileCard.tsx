import React from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { EmployeeProfile, UserRole } from '../../../shared/types';
import { MessageSquare } from 'lucide-react';

interface ProfileCardProps {
  profile: EmployeeProfile;
  userRole: UserRole;
  isOwnProfile: boolean;
  onViewProfile: (id: string) => void;
  onEditProfile?: (id: string) => void;
  onLeaveFeedback?: (id: string, name: string) => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  userRole,
  isOwnProfile,
  onViewProfile,
  onEditProfile,
  onLeaveFeedback,
  className = ''
}) => {
  const canEdit = userRole === UserRole.MANAGER || isOwnProfile;
  const canSeeSensitiveData = userRole === UserRole.MANAGER || isOwnProfile;
  // Allow employees, co-workers, and managers to leave feedback for others
  const canLeaveFeedback = !isOwnProfile && (userRole === UserRole.MANAGER || userRole === UserRole.COWORKER || userRole === UserRole.EMPLOYEE);

  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${isOwnProfile ? 'ring-2 ring-blue-500 bg-blue-900' : ''} ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0 relative">
          <img
            src={profile.profileImage || '/avatar-placeholder.jpg'}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-20 h-20 object-cover border-2 border-gray-600"
          />
          {/* "You" indicator */}
          {isOwnProfile && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 shadow-lg">
              YOU
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-gray-300">{profile.position}</p>
            </div>
            <Badge variant="primary" size="sm">
              {profile.department}
            </Badge>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-300 mt-2 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="default" size="sm">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <Badge variant="info" size="sm">
                    +{profile.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Sensitive Data (managers and profile owners only) */}
          {canSeeSensitiveData && (
            <div className="mt-3 text-sm text-gray-400">
              <p>Employee ID: {profile.employeeId}</p>
              <p>Start Date: {profile.startDate ? new Date(profile.startDate).toLocaleDateString() : 'N/A'}</p>
              {profile.performanceRating && (
                <p>Rating: {profile.performanceRating}/5.0</p>
              )}
            </div>
          )}

          {/* Feedback Info - Only visible to managers */}
          {userRole === UserRole.MANAGER && !isOwnProfile && (
            <div className="mt-3 text-sm text-purple-600">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>{profile.feedbackCount || 0} feedback received</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(profile.id)}
            >
              View Profile
            </Button>
            {canEdit && onEditProfile && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEditProfile(profile.id)}
              >
                Edit
              </Button>
            )}
            {/* Show feedback action for co-workers and employees viewing other profiles */}
            {canLeaveFeedback && onLeaveFeedback && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onLeaveFeedback(profile.id, `${profile.firstName} ${profile.lastName}`)}
              >
                Leave Feedback
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
