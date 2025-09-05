import React, { useState } from 'react';
import { AbsenceRequest } from '../../../shared/types';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Card } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/ToastProvider';
import { Calendar, AlertCircle } from 'lucide-react';

interface AbsenceRequestFormProps {
  onRequestCreated: (request: AbsenceRequest) => void;
  employeeId: string;
}

const ABSENCE_TYPES = [
  'Vacation',
  'Sick Leave',
  'Personal',
  'Medical Appointment',
  'Family Emergency',
  'Other'
];

export const AbsenceRequestForm: React.FC<AbsenceRequestFormProps> = ({
  onRequestCreated,
  employeeId
}) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    absenceType: 'Vacation'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    
    if (!formData.reason.trim()) {
      setError('Reason is required');
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate < startDate) {
      setError('End date cannot be before start date');
      return false;
    }

    if (formData.reason.length > 500) {
      setError('Reason cannot exceed 500 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/absence/employee/${employeeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: `${formData.absenceType}: ${formData.reason}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Absence Request Created', 'Your request has been submitted for approval');
        onRequestCreated(data.data);
        
        // Reset form
        setFormData({
          startDate: '',
          endDate: '',
          reason: '',
          absenceType: 'Vacation'
        });
      } else {
        showError('Failed to Create Request', data.error || 'Failed to create absence request');
      }
    } catch (err) {
      console.error('Error creating absence request:', err);
      showError('Network Error', 'Failed to create absence request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days;
    }
    return 0;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-900">
          <Calendar className="w-6 h-6 text-blue-400" />
        </div>
        <div className="ml-3">
          <h2 className="text-xl font-semibold text-white">New Absence Request</h2>
          <p className="text-gray-300">Request time off from work</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <span className="text-red-200">{error}</span>
        </div>
      )}



      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-200 mb-2">
              Start Date *
            </label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(value) => handleInputChange('startDate', value)}
              required
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-200 mb-2">
              End Date *
            </label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(value) => handleInputChange('endDate', value)}
              required
              className="w-full"
            />
          </div>
        </div>

        {/* Days Calculation */}
        {calculateDays() > 0 && (
          <div className="p-3 bg-blue-900 border border-blue-700">
            <p className="text-sm text-blue-200">
              <strong>Duration:</strong> {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Absence Type */}
        <div>
          <label htmlFor="absenceType" className="block text-sm font-medium text-gray-200 mb-2">
            Absence Type
          </label>
          <select
            id="absenceType"
            value={formData.absenceType}
            onChange={(e) => handleInputChange('absenceType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
          >
            {ABSENCE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-200 mb-2">
            Reason *
          </label>
          <textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Please provide details about your absence request..."
            required
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-800 text-white"
          />
          <p className="text-sm text-gray-400 mt-1">
            {formData.reason.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                startDate: '',
                endDate: '',
                reason: '',
                absenceType: 'Vacation'
              });
              setError(null);

            }}
            disabled={loading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? 'Creating...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
