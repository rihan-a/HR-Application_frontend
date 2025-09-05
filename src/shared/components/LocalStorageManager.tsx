import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { localStorageService } from '../services/localStorage';
import { Download, Trash2, Database, RefreshCw } from 'lucide-react';

export const LocalStorageManager: React.FC = () => {
  const [metadata, setMetadata] = useState(localStorageService.getMetadata());
  const [feedbackCount, setFeedbackCount] = useState(localStorageService.loadFeedback().length);

  const handleRefresh = () => {
    setMetadata(localStorageService.getMetadata());
    setFeedbackCount(localStorageService.loadFeedback().length);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local feedback data? This action cannot be undone.')) {
      localStorageService.clearFeedback();
      handleRefresh();
    }
  };

  const handleExportData = () => {
    const feedback = localStorageService.loadFeedback();
    const data = {
      feedback,
      metadata: localStorageService.getMetadata(),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Local Storage Manager</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center space-x-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3">
            <p className="text-sm text-gray-600">Total Feedback</p>
            <p className="text-2xl font-bold text-gray-900">{feedbackCount}</p>
          </div>
          <div className="bg-gray-50 p-3">
            <p className="text-sm text-gray-600">Last Sync</p>
            <p className="text-sm font-medium text-gray-900">
              {metadata?.lastSync ? new Date(metadata.lastSync).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="flex items-center space-x-1"
            disabled={feedbackCount === 0}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
            disabled={feedbackCount === 0}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Data</span>
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>💡 Local storage provides offline support and faster loading times.</p>
          <p>📱 Data persists between browser sessions and survives page refreshes.</p>
        </div>
      </div>
    </Card>
  );
};
