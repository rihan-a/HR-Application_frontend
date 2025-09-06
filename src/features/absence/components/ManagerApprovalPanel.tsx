import React, { useState, useEffect } from 'react';
import { AbsenceRequest, AbsenceStatus, EmployeeProfile } from '../../../shared/types';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useToast } from '../../../shared/components/ui/ToastProvider';
import { getApiUrl } from '../../../shared/services/apiConfig';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ManagerApprovalPanelProps {
  requests: AbsenceRequest[];
  onRequestUpdated: (request: AbsenceRequest) => void;
}

export const ManagerApprovalPanel: React.FC<ManagerApprovalPanelProps> = ({
  requests,
  onRequestUpdated
}) => {
  const { showSuccess, showError } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [employeeProfiles, setEmployeeProfiles] = useState<Map<string, EmployeeProfile>>(new Map());

  useEffect(() => {
    // Fetch employee profiles for all unique employee IDs in requests
    const fetchEmployeeProfiles = async () => {
      // Extract employee IDs from the employeeId field in the request
      const uniqueEmployeeIds = [...new Set(requests
        .map(req => req.employeeId)
        .filter((id): id is string => id !== undefined)
      )];
      
      for (const employeeId of uniqueEmployeeIds) {
        try {
          const response = await fetch(getApiUrl(`/api/profiles/${employeeId}`), {
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

  const getEmployeeName = (request: AbsenceRequest) => {
    // Use the employeeId field from the request
    const employeeId = request.employeeId;
    if (!employeeId) {
      return 'Unknown Employee';
    }
    const profile = employeeProfiles.get(employeeId);
    return profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Employee';
  };

  const getEmployeeDepartment = (request: AbsenceRequest) => {
    // Use the employeeId field from the request
    const employeeId = request.employeeId;
    if (!employeeId) {
      return 'Unknown Department';
    }
    const profile = employeeProfiles.get(employeeId);
    return profile?.department || 'Unknown Department';
  };

  const handleApproval = async (requestId: string, status: AbsenceStatus) => {
    setProcessingId(requestId);

    try {
      const response = await fetch(getApiUrl(`/api/absence/${requestId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        const action = status === AbsenceStatus.APPROVED ? 'approved' : 'rejected';
        showSuccess(`Request ${action.charAt(0).toUpperCase() + action.slice(1)}`, `The absence request has been ${action}`);
        onRequestUpdated(data.data);
      } else {
        showError('Action Failed', data.error || `Failed to ${status} absence request`);
      }
    } catch (err) {
      console.error(`Error ${status} absence request:`, err);
      showError('Network Error', `Failed to ${status} absence request. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-900 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-300">
          There are no pending absence requests that need your approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Pending Approvals</h2>
          <p className="text-gray-300">
            {requests.length} request{requests.length !== 1 ? 's' : ''} awaiting your review
          </p>
        </div>
        <Badge className="bg-yellow-900 text-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          {requests.length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const days = calculateDays(request.startDate, request.endDate);
          const isProcessing = processingId === request.id;
          const employeeName = getEmployeeName(request);
          const employeeDepartment = getEmployeeDepartment(request);
          
          return (
            <Card key={request.id} className="p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <Badge className="bg-yellow-900 text-yellow-200">
                        Pending Approval
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-white">{employeeName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-300">{employeeDepartment}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  </div>

                  <div className="bg-gray-800 p-4 mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Reason</h4>
                    <p className="text-sm text-gray-300">{request.reason}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-900 p-3">
                      <p className="text-blue-300 font-medium">Duration</p>
                      <p className="text-blue-100">{days} day{days !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-purple-900 p-3">
                      <p className="text-purple-300 font-medium">Days Since Request</p>
                      <p className="text-purple-100">
                        {Math.ceil((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24))} day{Math.ceil((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <Button
                    onClick={() => handleApproval(request.id, AbsenceStatus.APPROVED)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </Button>
                  
                  <Button
                    onClick={() => handleApproval(request.id, AbsenceStatus.REJECTED)}
                    disabled={isProcessing}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900 min-w-[120px]"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-900 border border-blue-700 p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-blue-400 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-200">Approval Summary</h4>
            <p className="text-sm text-blue-300">
              You have {requests.length} pending absence request{requests.length !== 1 ? 's' : ''} to review. 
              Please review each request carefully and approve or reject based on business needs and team coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
