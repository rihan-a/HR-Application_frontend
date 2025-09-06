import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/ui';
import { ProfileCard } from './ProfileCard';
import { EmployeeProfile, UserRole } from '../../../shared/types';
import { useAuth } from '../../auth/AuthContext';
import { getApiUrl } from '../../../shared/services/apiConfig';

interface ProfileDashboardProps {
  onViewProfile: (id: string) => void;
  onEditProfile: (id: string) => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  onViewProfile,
  onEditProfile
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
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, selectedDepartment]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/profiles/list/all'), {
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
      const response = await fetch(getApiUrl('/api/profiles/departments/list'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }); 
      if (response.ok) {
        const data = await response.json();

        setDepartments(data.departments || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch departments:', errorData);
      }
    } catch (error) {
      console.error('Network error fetching departments:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading profiles..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">Employee Profiles</h1>
          <p className="text-gray-400">Manage and view all employee information</p>
        </div>
        <Badge variant="info" size="lg">
          {filteredProfiles.length} employees
        </Badge>
      </div>

      {/* Debug Info */}
      {/* <Card>
        <div className="text-sm text-gray-600">
          <p>Total profiles loaded: {profiles.length}</p>
          <p>Departments loaded: {departments.length}</p>
          <p>Filtered profiles: {filteredProfiles.length}</p>
          <p>Search term: "{searchTerm}"</p>
          <p>Selected department: "{selectedDepartment}"</p>
        </div>
      </Card> */}

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search Employees"
            placeholder="Search by name, position, or department..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              size='md'
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
            <p className="text-gray-500 text-lg">No employees found matching your criteria</p>
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
              onEditProfile={onEditProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
