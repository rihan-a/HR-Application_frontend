import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AbsenceRequest, AbsenceStatus } from '../../shared/types';
import { AbsenceRequestForm } from './components/AbsenceRequestForm';
import { AbsenceList } from './components/AbsenceList';
import { AbsenceStatistics } from './components/AbsenceStatistics';
import { Button } from '../../shared/components/ui/Button';
import { Calendar, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const AbsencePage: React.FC = () => {
  const { user } = useAuth();
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-requests' | 'new-request'>('my-requests');

  useEffect(() => {
    if (user) {
      fetchAbsenceRequests();
    }
  }, [user, activeTab]);

  const fetchAbsenceRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Employees see only their own requests
      const response = await fetch(`/api/absence/employee/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAbsenceRequests(data.data || []);
      } else {
        throw new Error('Failed to fetch absence requests');
      }
    } catch (err) {
      console.error('Error fetching absence requests:', err);
      setError('Failed to load absence requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreated = (newRequest: AbsenceRequest) => {
    setAbsenceRequests(prev => [newRequest, ...prev]);
    setActiveTab('my-requests');
  };

  const handleRequestUpdated = (updatedRequest: AbsenceRequest) => {
    setAbsenceRequests(prev => 
      prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
    );
  };

  const handleRequestDeleted = (requestId: string) => {
    setAbsenceRequests(prev => prev.filter(req => req.id !== requestId));
  };



  const getQuickStats = () => {
    const myRequests = absenceRequests.filter(req => req.status !== AbsenceStatus.REJECTED);
    
    const pending = myRequests.filter(req => req.status === AbsenceStatus.PENDING).length;
    const approved = myRequests.filter(req => req.status === AbsenceStatus.APPROVED).length;
    const rejected = myRequests.filter(req => req.status === AbsenceStatus.REJECTED).length;

    return { pending, approved, rejected, total: myRequests.length };
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
          <h1 className="text-3xl font-bold text-white">My Absence Requests</h1>
          <p className="text-gray-300 mt-1">
            Request time off and track your absence history
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setActiveTab('new-request')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Request Time Off
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-900">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-300">Total Requests</p>
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
              <p className="text-sm font-medium text-gray-300">Pending</p>
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
            onClick={() => setActiveTab('my-requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-requests'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            My Requests
          </button>
          
          <button
            onClick={() => setActiveTab('new-request')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new-request'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            New Request
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'my-requests' && (
          <AbsenceList
            requests={absenceRequests}
            loading={loading}
            error={error}
            onRequestUpdated={handleRequestUpdated}
            onRequestDeleted={handleRequestDeleted}
            isManager={false}
            onNewRequest={() => setActiveTab('new-request')}
          />
        )}
        
        {activeTab === 'new-request' && (
          <AbsenceRequestForm
            onRequestCreated={handleRequestCreated}
            employeeId={user.id}
          />
        )}
      </div>

      {/* Statistics */}
      <AbsenceStatistics employeeId={user.id} />
    </div>
  );
};
