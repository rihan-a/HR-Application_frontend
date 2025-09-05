import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from '../types/index';
import { LogOut, User, Shield, Briefcase, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return <Shield className="w-4 h-4 text-green-600" />;
      case UserRole.EMPLOYEE:
        return <User className="w-4 h-4 text-blue-600" />;
      case UserRole.COWORKER:
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.EMPLOYEE:
        return 'Employee';
      case UserRole.COWORKER:
        return 'Co-worker';
      default:
        return 'Unknown';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'bg-green-900 text-green-200 border-green-700';
      case UserRole.EMPLOYEE:
        return 'bg-blue-900 text-blue-200 border-blue-700';
      case UserRole.COWORKER:
        return 'bg-purple-900 text-purple-200 border-purple-700';
      default:
        return 'bg-gray-800 text-gray-200 border-gray-600';
    }
  };

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">

            <h1 className="ml-3 text-xl font-semibold text-white">
              Employee Profile System
            </h1>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <div className={`inline-flex items-center px-3 py-1 text-xs font-medium border ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="ml-1">{getRoleLabel(user.role)}</span>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-200">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
