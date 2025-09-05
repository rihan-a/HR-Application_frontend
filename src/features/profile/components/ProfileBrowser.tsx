import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { ProfileCard } from './ProfileCard';
import { EmployeeProfile, UserRole } from '../../../shared/types';
import { useAuth } from '../../auth/AuthContext';
import { getApiUrl } from '../../../shared/services/apiConfig';
import { MessageSquare, Search } from 'lucide-react';

interface ProfileBrowserProps {
  onViewProfile: (id: string) => void;
  onLeaveFeedback?: (id: string, name: string) => void;
}

export const ProfileBrowser: React.FC<ProfileBrowserProps> = ({
  onViewProfile,
  onLeaveFeedback
}) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  useEffect(() => {
    fetchProfiles();
    fetchDepartments();
    
    // Listen for feedback submission events to refresh profiles
    const handleFeedbackSubmitted = () => {
      fetchProfiles();
    };
    
    window.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    
    return () => {
      window.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    };
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, selectedDepartment]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);

      
      const response = await fetch(getApiUrl('/api/profiles/browse'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      

      
      if (response.ok) {
        const data = await response.json();

        setProfiles(data.profiles || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch profiles:', errorData);
      }
    } catch (error) {
      console.error('Network error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Extract departments from the profiles we have
      const uniqueDepartments = [...new Set(profiles.map(profile => profile.department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error extracting departments:', error);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.firstName.toLowerCase().includes(term) ||
        profile.lastName.toLowerCase().includes(term) ||
        profile.position.toLowerCase().includes(term) ||
        profile.department.toLowerCase().includes(term)
      );
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(profile => profile.department === selectedDepartment);
    }

    setFilteredProfiles(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
  };

  const handleLeaveFeedback = (id: string, name: string) => {
    if (onLeaveFeedback) {
      onLeaveFeedback(id, name);
    } else {
      // Fallback: navigate to profile view where feedback can be left
      onViewProfile(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const roleText = user?.role === UserRole.MANAGER ? 'employees' : 'colleagues';
  const roleColor = user?.role === UserRole.MANAGER ? 'blue' : 'green';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user?.role === UserRole.MANAGER ? 'Browse Employee Profiles' : 'Browse Colleague Profiles'}
          </h1>
          <p className="text-gray-300">
            View public information and leave feedback for your {roleText}
          </p>
        </div>
        <Badge variant="info" size="lg">
          {filteredProfiles.length} {roleText}
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              label={`Search ${roleText.charAt(0).toUpperCase() + roleText.slice(1)}`}
              placeholder={`Search by name, position, or department...`}
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-${roleColor}-500 focus:border-${roleColor}-500`}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-400 text-lg mt-2">No {roleText} found matching your criteria</p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProfiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              userRole={user?.role || UserRole.COWORKER}
              isOwnProfile={user?.id === profile.id}
              onViewProfile={onViewProfile}
              onEditProfile={() => {}} // No edit functionality for browsing
              onLeaveFeedback={handleLeaveFeedback}
            />
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <div className="text-center py-6">
          <MessageSquare className={`mx-auto h-8 w-8 text-${roleColor}-600 mb-2`} />
          <h3 className="text-lg font-medium text-white mb-2">Ready to Leave Feedback?</h3>
          <p className="text-gray-300">
            Click on any profile to view more details and leave feedback for your {roleText}. 
            Your feedback helps build a positive and collaborative work environment.
          </p>
        </div>
      </Card>
    </div>
  );
};
