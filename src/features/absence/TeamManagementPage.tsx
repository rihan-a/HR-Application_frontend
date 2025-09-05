import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AbsenceRequest, AbsenceStatus } from '../../shared/types';
import { TeamRequestsList } from './components/TeamRequestsList';
import { ManagerApprovalPanel } from './components/ManagerApprovalPanel';
import { Calendar, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../../shared/services/apiConfig';

export const TeamManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'team-requests' | 'approvals'>('approvals');

  useEffect(() => {
    if (user) {
      fetchAbsenceRequests();
    }
  }, [user, activeTab]);

  const fetchAbsenceRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all team requests
      const response = await fetch(getApiUrl('/api/absence'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAbsenceRequests(data.data || []);
      } else {
        throw new Error('Failed to fetch team absence requests');
      }
    } catch (err) {
      console.error('Error fetching team absence requests:', err);
      setError('Failed to load team absence requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdated = (updatedRequest: AbsenceRequest) => {
    setAbsenceRequests(prev => 
      prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
    );
  };

  const getQuickStats = () => {
    const pending = absenceRequests.filter(req => req.status === AbsenceStatus.PENDING).length;
    const approved = absenceRequests.filter(req => req.status === AbsenceStatus.APPROVED).length;
    const rejected = absenceRequests.filter(req => req.status === AbsenceStatus.REJECTED).length;
    const total = absenceRequests.length;

    return { pending, approved, rejected, total };
  };

  const getPendingApprovalsCount = () => {
    return absenceRequests.filter(req => req.status === AbsenceStatus.PENDING).length;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const stats = getQuickStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Absence Management</h1>
          <p className="text-gray-300 mt-1">
            Manage and approve absence requests from your team members
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-900">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-300">Total Team Requests</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-900">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-300">Pending Approval</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-900">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-300">Approved</p>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-900">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-300">Rejected</p>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
     <button
            onClick={() => setActiveTab('approvals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'approvals'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            Approvals
            {getPendingApprovalsCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center">
                {getPendingApprovalsCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('team-requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'team-requests'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            All Team Requests
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'team-requests' && (
          <TeamRequestsList
            requests={absenceRequests}
            loading={loading}
            error={error}
          />
        )}
        
        {activeTab === 'approvals' && (
          <ManagerApprovalPanel
            requests={absenceRequests.filter(req => req.status === AbsenceStatus.PENDING)}
            onRequestUpdated={handleRequestUpdated}
          />
        )}
      </div>
    </div>
  );
};
