import React, { useState } from 'react';
import { AbsenceRequest, AbsenceStatus } from '../../../shared/types';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useToast } from '../../../shared/components/ui/ToastProvider';
import { getApiUrl } from '../../../shared/services/apiConfig';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  User
} from 'lucide-react';

interface AbsenceListProps {
  requests: AbsenceRequest[];
  loading: boolean;
  error: string | null;
  onRequestUpdated: (request: AbsenceRequest) => void;
  onRequestDeleted: (requestId: string) => void;
  isManager: boolean;
  onNewRequest?: () => void;
}

export const AbsenceList: React.FC<AbsenceListProps> = ({
  requests,
  loading,
  error,
  onRequestDeleted,
  isManager,
  onNewRequest
}) => {
  const { showSuccess, showError } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (requestId: string, employeeId: string) => {
    if (!confirm('Are you sure you want to delete this absence request?')) {
      return;
    }

    setDeletingId(requestId);

    try {
      const response = await fetch(getApiUrl(`/api/absence/${requestId}/employee/${employeeId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        showSuccess('Request Deleted', 'The absence request has been deleted successfully');
        onRequestDeleted(requestId);
      } else {
        const data = await response.json();
        showError('Delete Failed', data.error || 'Failed to delete absence request');
      }
    } catch (err) {
      console.error('Error deleting absence request:', err);
      showError('Network Error', 'Failed to delete absence request. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-300">Loading absence requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-900 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Error Loading Requests</h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-900 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Absence Requests</h3>
        <p className="text-gray-300 mb-6">
          {isManager 
            ? 'No absence requests have been submitted yet.'
            : 'You haven\'t submitted any absence requests yet.'
          }
        </p>
        {!isManager && onNewRequest && (
          <Button
            onClick={onNewRequest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Request Your First Time Off
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const days = calculateDays(request.startDate, request.endDate);
        const canDelete = request.status === AbsenceStatus.PENDING;
        
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
                  
                  {isManager && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      <span>Employee Request</span>
                    </div>
                  )}
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

              <div className="flex items-center space-x-2 ml-4">
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(request.id, 'current-user')} // This would need to be passed as prop
                    disabled={deletingId === request.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingId === request.id ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
