import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { Layout } from './shared/components/Layout';
import { LoginForm } from './features/auth/LoginForm';
import { Dashboard } from './features/profile/Dashboard';
import { ProfileView } from './features/profile/components/ProfileView';
import { ProfileDashboard } from './features/profile/components/ProfileDashboard';
import { ProfileEditModal } from './features/profile/components/ProfileEditModal';
import { UserRole, EmployeeProfile } from './shared/types/index';
import { ProfileBrowser } from './features/profile/components/ProfileBrowser';

import { FeedbackList } from './features/feedback/components/FeedbackList';
import { AbsencePage, ManagerAbsencePage, TeamManagementPage } from './features/absence';
import { ToastProvider } from './shared/components/ui/ToastProvider';
import { LoadingSpinner } from './shared/components/ui';
import { MessageSquare } from 'lucide-react';
import { getApiUrl } from './shared/services/apiConfig';
import { Analytics } from '@vercel/analytics/react';

// Feedback wrapper component
const Feedback = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReceivedFeedback();
    }
  }, [user]);

  const fetchReceivedFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('/api/feedback/received'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiFeedback = data.data || [];
        setFeedback(apiFeedback);
      } else {
        setError('Failed to fetch feedback');
      }
    } catch (err) {
      console.error('❌ Error in fetchReceivedFeedback:', err);
      setError('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }

  // Show received feedback for the current user
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Feedback Received</h2>
        <p className="text-gray-300 mt-1">
          View feedback and recognition from your colleagues
        </p>
      </div>

      {/* Feedback List */}
      <FeedbackList
        feedback={feedback}
        loading={loading}
        error={error}
        currentUser={{
          id: user.id,
          role: user.role
        }}
        onDelete={async () => Promise.resolve()} // No delete functionality for received feedback
        showEnhanced={true}
      />

      {/* Empty State - Only show if no feedback and not loading */}
      {!loading && !error && feedback.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Feedback Yet</h3>
          <p className="text-gray-300">
            When your colleagues leave feedback for you, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

// Wrapper components for profile management
const ProfileViewWrapper = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<EmployeeProfile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const token = localStorage.getItem('authToken')

  const handleEditProfile = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`api/profiles/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json();
        setEditingProfile(data.profile);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch profile for editing:', error)
    }
  }


  const handleSaveProfile = async (updatedData: Partial<EmployeeProfile>) => {
    if (!editingProfile) return;

    try {
      const response = await fetch(getApiUrl(`/api/profiles/${editingProfile.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        // Close the modal and trigger a refresh of the profile data
        setEditModalOpen(false);
        setEditingProfile(null);
        // Trigger a refresh by updating the refresh trigger
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <>
      <ProfileView onEditProfile={handleEditProfile} refreshTrigger={refreshTrigger} />
      <ProfileEditModal
        profile={editingProfile}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
};

// Manager only full profiles browser
const ProfileDashboardWrapper = () => {
  const navigate = useNavigate();

  const handleViewProfile = (id: string) => {
    navigate(`/profile/${id}`);
  };

  const handleEditProfile = (id: string) => {
    // Navigate to profile view for editing
    navigate(`/profile/${id}`);
  };
  const handleLeaveFeedback = (id: string) => {
    // Navigate to the profile view where feedback can be left
    navigate(`/profile/${id}?tab=feedback`);
  };

  return (
    <ProfileDashboard
      onViewProfile={handleViewProfile}
      onEditProfile={handleEditProfile}
      onLeaveFeedback={handleLeaveFeedback}
    />
  );
};

const ProfileBrowserWrapper = () => {
  const navigate = useNavigate();

  const handleViewProfile = (id: string) => {
    navigate(`/profile/${id}`);
  };

  const handleLeaveFeedback = (id: string) => {
    // Navigate to the profile view where feedback can be left
    navigate(`/profile/${id}?tab=feedback`);
  };

  return (
    <ProfileBrowser
      onViewProfile={handleViewProfile}
      onLeaveFeedback={handleLeaveFeedback}
    />
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner size="xl" fullScreen text="Loading..." />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfileViewWrapper />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/*Managers only all full profiles browser*/}
      <Route
        path="/profiles"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <Layout>
              <ProfileDashboardWrapper />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Limited details profiles browser for all employees expect managers*/}
      <Route
        path="/profiles/browse"
        element={
          <ProtectedRoute allowedRoles={[UserRole.COWORKER, UserRole.EMPLOYEE]}>
            <Layout>
              <ProfileBrowserWrapper />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <Layout>
              <Feedback />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/absence"
        element={
          <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE, UserRole.COWORKER]}>
            <Layout>
              <AbsencePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/absence"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <Layout>
              <ManagerAbsencePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/team"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <Layout>
              <TeamManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Analytics />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
