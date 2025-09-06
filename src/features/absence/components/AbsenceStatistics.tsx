import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { LoadingSpinner } from '../../../shared/components/ui';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp
} from 'lucide-react';
import { getAppConfig, AppConfig } from '../../../shared/services/configService';
import { getApiUrl } from '../../../shared/services/apiConfig';

interface AbsenceStatisticsProps {
  employeeId: string;
}

interface AbsenceStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
}

export const AbsenceStatistics: React.FC<AbsenceStatisticsProps> = ({ employeeId }) => {
  const [stats, setStats] = useState<AbsenceStats | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both statistics and config in parallel
      const [, appConfig] = await Promise.all([
        fetchStatistics(),
        getAppConfig()
      ]);

      setConfig(appConfig);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    const response = await fetch(getApiUrl(`/api/absence/employee/${employeeId}/statistics`), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setStats(data.data);
    } else {
      throw new Error('Failed to fetch statistics');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" text="Loading statistics..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  if (!stats || !config) {
    return null;
  }



  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-purple-900">
          <TrendingUp className="w-6 h-6 text-purple-400" />
        </div>
        <div className="ml-3">
          <h2 className="text-xl font-semibold text-white">Absence Statistics</h2>
          <p className="text-gray-300">Your absence request history and trends</p>
        </div>
      </div>

 
        {/* Total Requests */}
       

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Days Taken */}
        <div className="bg-blue-900 p-6 border-2 border-blue-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-800">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-300">Days Taken This Year</p>
              <p className="text-3xl font-bold text-blue-100">{stats.totalDaysRequested}</p>
              <p className="text-xs text-blue-200 mt-1">Approved absence days</p>
            </div>
          </div>
        </div>

        {/* Days Remaining */}
        <div className="bg-green-900 p-6 border-2 border-green-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-800">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-300">Days Remaining</p>
              <p className="text-3xl font-bold text-green-100">{Math.max(0, config.annualVacationDays - stats.totalDaysRequested)}</p>
              <p className="text-xs text-green-200 mt-1">Out of {config.annualVacationDays} annual days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-900 border border-blue-700">
        <h4 className="text-sm font-medium text-blue-200 mb-2">Your Absence Summary</h4>
        <div className="text-sm text-blue-300 space-y-1">
          {stats.pendingRequests > 0 && (
            <p>• You have {stats.pendingRequests} request{stats.pendingRequests !== 1 ? 's' : ''} pending approval</p>
          )}
          {stats.totalDaysRequested > 0 && (
            <p>• You've taken {stats.totalDaysRequested} day{stats.totalDaysRequested !== 1 ? 's' : ''} off this year</p>
          )}
          {stats.totalDaysRequested < config.annualVacationDays && (
            <p>• You have {config.annualVacationDays - stats.totalDaysRequested} day{config.annualVacationDays - stats.totalDaysRequested !== 1 ? 's' : ''} remaining for this year</p>
          )}
          {stats.totalDaysRequested >= config.annualVacationDays && (
            <p>• You've used all your annual leave days for this year</p>
          )}
          {stats.totalRequests === 0 && (
            <p>• You haven't submitted any absence requests yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};
