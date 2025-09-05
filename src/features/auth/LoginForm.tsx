import React, { useState } from 'react';
import { UserRole } from '../../shared/types/index';
import { useAuth } from './AuthContext';


export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const demoUsers = [
    {
      email: 'manager@newwork.com',
      role: UserRole.MANAGER,
      label: 'Manager (Full Access)'
    },
    {
      email: 'employee@newwork.com',
      role: UserRole.EMPLOYEE,
      label: 'Employee (Own Profile)'
    },
    {
      email: 'coworker@newwork.com',
      role: UserRole.COWORKER,
      label: 'Co-worker (Public Data)'
    },
  ];

  const quickLogin = async (email: string, role: UserRole) => {
    try {
      setError('');
      await login({ email, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Employee Profile System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Sign in to access your profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 shadow sm:px-10 border border-gray-700">
          {error && (
            <div className="mb-6 bg-red-900 p-4 border border-red-700">
              <div className="text-sm text-red-200">{error}</div>
            </div>
          )}

          <div>
            <div className="relative">

              <div className="relative flex justify-center text-sm">
                <span className=" bg-gray-900 text-gray-300">Quick Demo Login</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {demoUsers.map((demoUser) => (
                <button
                  key={demoUser.email}
                  onClick={() => quickLogin(demoUser.email, demoUser.role)}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 shadow-sm bg-gray-800 text-sm font-medium text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-gray-300"></div>
                  ) : (
                    demoUser.label
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
