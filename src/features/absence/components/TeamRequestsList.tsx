import React, { useState, useEffect } from 'react';
import { AbsenceRequest, AbsenceStatus, EmployeeProfile } from '../../../shared/types';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  Building
} from 'lucide-react';

interface TeamRequestsListProps {
  requests: AbsenceRequest[];
  loading: boolean;
  error: string | null;
}

export const TeamRequestsList: React.FC<TeamRequestsListProps> = ({
  requests,
  loading,
  error
}) => {
  const [employeeProfiles, setEmployeeProfiles] = useState<Map<string, EmployeeProfile>>(new Map());

  useEffect(() => {
    // Fetch employee profiles for all unique employee IDs in requests
    const fetchEmployeeProfiles = async () => {
      const uniqueEmployeeIds = [...new Set(requests.map(req => req.id.split('_')[0]))];
      
      for (const employeeId of uniqueEmployeeIds) {
        try {
          const response = await fetch(`/api/profiles/${employeeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setEmployeeProfiles(prev => new Map(prev.set(employeeId, data.profile)));
          }
        } catch (err) {
          console.error(`Failed to fetch profile for employee ${employeeId}:`, err);
        }
      }
    };

    if (requests.length > 0) {
      fetchEmployeeProfiles();
    }
  }, [requests]);

  const getStatusIcon = (status: AbsenceStatus) => {
    switch (status) {
      case AbsenceStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case AbsenceStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case AbsenceStatus.PENDING:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: AbsenceStatus) => {
    switch (status) {
      case AbsenceStatus.APPROVED:
        return 'bg-green-900 text-green-200';
      case AbsenceStatus.REJECTED:
        return 'bg-red-900 text-red-200';
      case AbsenceStatus.PENDING:
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const getEmployeeName = (requestId: string) => {
    // Extract employee ID from request ID (assuming format: absence_timestamp_random)
    const employeeId = requestId.split('_')[0];
    const profile = employeeProfiles.get(employeeId);
    return profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Employee';
  };

  const getEmployeeDepartment = (requestId: string) => {
    const employeeId = requestId.split('_')[0];
    const profile = employeeProfiles.get(employeeId);
    return profile?.department || 'Unknown Department';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-300">Loading team requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-900 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Error Loading Team Requests</h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-900 flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Team Requests</h3>
        <p className="text-gray-300">
          No absence requests have been submitted by your team members yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const days = calculateDays(request.startDate, request.endDate);
        const employeeName = getEmployeeName(request.id);
        const employeeDepartment = getEmployeeDepartment(request.id);
        
        return (
          <Card key={request.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-white">{employeeName}</span>
                    <span className="text-gray-500">•</span>
                    <span>{employeeDepartment}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                      <p className="text-xs text-gray-400">{days} day{days !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {formatDate(request.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400">Requested</p>
                    </div>
                  </div>

                  {request.updatedAt !== request.createdAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {formatDate(request.updatedAt)}
                        </p>
                        <p className="text-xs text-gray-400">Updated</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-800 p-3">
                  <p className="text-sm text-gray-300">{request.reason}</p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
