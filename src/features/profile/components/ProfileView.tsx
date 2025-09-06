import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { EmployeeProfile, UserRole } from '../../../shared/types';
import { useAuth } from '../../auth/AuthContext';
import { FeedbackForm } from '../../feedback/components/FeedbackForm';
import { FeedbackList } from '../../feedback/components/FeedbackList';
import { useFeedback } from '../../feedback/hooks/useFeedback';
import { getApiUrl } from '../../../shared/services/apiConfig';
import { MessageSquare, User } from 'lucide-react';

interface ProfileViewProps {
  onEditProfile?: (id: string) => void;
  refreshTrigger?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onEditProfile, refreshTrigger }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'feedback'>('profile');
  
  const { feedback, loading: feedbackLoading, error: feedbackError, createFeedback, deleteFeedback, refreshFeedback } = useFeedback();

  useEffect(() => {
    if (id) {
      fetchProfile(id);
      // Check if feedback tab is requested via URL
      if (searchParams.get('tab') === 'feedback') {
        setActiveTab('feedback');
      }
    }
  }, [id, searchParams]);

  // Refetch profile when refreshTrigger changes
  useEffect(() => {
    if (id && refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchProfile(id);
    }
  }, [refreshTrigger, id]);

  useEffect(() => {
    if (id && activeTab === 'feedback') {
      refreshFeedback(id);
    }
  }, [id, activeTab, refreshFeedback]);

  const fetchProfile = async (profileId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(getApiUrl(`/api/profiles/${profileId}`), {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      

      
      if (response.ok) {
        const data = await response.json();

        setProfile(data.profile);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        setError(errorData.error || `Failed to load profile (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Network error: Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === UserRole.MANAGER || user?.id === id;
  const canSeeSensitiveData = user?.role === UserRole.MANAGER || user?.id === id;
  // Allow employees, co-workers, and managers to leave feedback for others
  const canLeaveFeedback = user?.id !== id && (user?.role === UserRole.MANAGER || user?.role === UserRole.COWORKER || user?.role === UserRole.EMPLOYEE);

  const handleFeedbackSubmit = async (feedbackData: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    content: string;
    enhancedContent?: string;
    isEnhanced: boolean;
  }) => {

    
    if (id) {
      try {
        await createFeedback(id, feedbackData);
        // Refresh feedback list
        await refreshFeedback(id);
        
        // Trigger a global event to refresh browse profiles
        window.dispatchEvent(new CustomEvent('feedbackSubmitted', { 
          detail: { profileId: id } 
        }));

      } catch (error) {
        console.error('❌ Error in feedback submission:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-400 text-lg mb-4">{error || 'Profile not found'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-xl text-gray-300">{profile.position}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="primary" size="md">
              {profile.department}
            </Badge>
            {user?.id === id && (
              <Badge variant="info" size="sm" className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Your Profile</span>
              </Badge>
            )}
            {user?.role === UserRole.MANAGER && (
              <Badge variant="success" size="sm" className="flex items-center space-x-1">
                <span>Manager View</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          {canEdit && onEditProfile && (
            <Button onClick={() => onEditProfile(profile.id)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feedback'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
              {feedback.filter(f => f.toUserId === id).length > 0 && (
                <Badge variant="info" size="sm">{feedback.filter(f => f.toUserId === id).length}</Badge>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center p-6">
                <img
                  src={profile.profileImage || '/avatar-placeholder.jpg'}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 object-cover border-4 border-gray-200 mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-white mb-2">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-300 mb-4">{profile.position}</p>
                
                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-300">
                  <p>{profile.email}</p>
                  <p>{profile.phone}</p>
                  <p>{profile.address}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
              </Card>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="default" size="md">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Professional Information (if visible) */}
            {canSeeSensitiveData && (
              <>
                <Card>
                  <h3 className="text-lg font-semibold text-white mb-4">Professional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Employee ID</p>
                      <p className="font-medium text-white">{profile.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Start Date</p>
                      <p className="font-medium text-white">{profile.startDate ? new Date(profile.startDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Salary</p>
                      <p className="font-medium text-white">${profile.salary?.toLocaleString()}</p>
                    </div>
                    {profile.performanceRating && (
                      <div>
                        <p className="text-sm text-gray-400">Performance Rating</p>
                        <p className="font-medium text-white">{profile.performanceRating}/5.0</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Certifications */}
                {profile.certifications && profile.certifications.length > 0 && (
                  <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, index) => (
                        <Badge key={index} variant="success" size="md">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Work History */}
                {profile.workHistory && profile.workHistory.length > 0 && (
                  <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Work History</h3>
                    <div className="space-y-3">
                      {profile.workHistory.map((job, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <p className="font-medium text-white">{job.position}</p>
                          <p className="text-gray-300">{job.company}</p>
                          <p className="text-sm text-gray-400">{job.duration}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Emergency Contact */}
                {profile.emergencyContact && profile.emergencyContact.name && (
                  <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="font-medium text-white">{profile.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="font-medium text-white">{profile.emergencyContact.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400">Relationship</p>
                        <p className="font-medium text-white">{profile.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Feedback Tab */
        <div className="space-y-6">
          {/* Feedback Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Feedback for {profile.firstName}</h2>
              <p className="text-gray-300">
                {user?.role === UserRole.MANAGER 
                  ? 'View all feedback and provide guidance as a manager'
                  : 'Share constructive feedback and recognize contributions'
                }
              </p>
            </div>
          </div>

          {/* Leave Feedback Form */}
          {canLeaveFeedback && user && (
            <FeedbackForm
              profileId={profile.id}
              currentUser={{
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
              }}
              employeeName={`${profile.firstName} ${profile.lastName}`}
              onSubmit={handleFeedbackSubmit}
            />
          )}

          {/* Feedback List */}
          <FeedbackList
            feedback={feedback}
            loading={feedbackLoading}
            error={feedbackError}
            currentUser={{
              id: user?.id || '',
              role: user?.role || UserRole.EMPLOYEE
            }}
            onDelete={deleteFeedback}
            showEnhanced={true}
          />
        </div>
      )}
    </div>
  );
};
