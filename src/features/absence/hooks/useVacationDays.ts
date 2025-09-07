import { useState, useEffect } from 'react';
import { getAppConfig, AppConfig } from '../../../shared/services/configService';
import { getApiUrl } from '../../../shared/services/apiConfig';
import { AbsenceStats, VacationDaysData } from '../../../shared/types';


export const useVacationDays = (employeeId: string): VacationDaysData & { detailedStats: AbsenceStats | null } => {
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
      console.error('Error fetching vacation days data:', err);
      setError('Failed to load vacation days data');
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

  const totalDays = config?.annualVacationDays || 0;
  const usedDays = stats?.totalDaysRequested || 0;
  const remainingDays = Math.max(0, totalDays - usedDays);

  return {
    totalDays,
    usedDays,
    remainingDays,
    loading,
    error,
    detailedStats: stats
  };
};
