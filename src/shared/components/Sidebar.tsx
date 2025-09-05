import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from '../types/index';
import { 
  User, 
  Users, 
  MessageSquare, 
  Calendar, 
  Home,
  Shield,
  Briefcase
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();


  if (!user) return null;

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.COWORKER]
    },
    {
      name: 'My Profile',
      href: `/profile/${user.id}`,
      icon: <User className="w-5 h-5" />,
      roles: [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.COWORKER]
    },
    {
      name: 'All Profiles',
      href: '/profiles',
      icon: <Users className="w-5 h-5" />,
      roles: [UserRole.MANAGER]
    },
    {
      name: 'Browse Profiles',
      href: '/profiles/browse',
      icon: <Users className="w-5 h-5" />,
      roles: [UserRole.COWORKER, UserRole.EMPLOYEE]
    },
    {
      name: 'Feedback Received',
      href: '/feedback',
      icon: <MessageSquare className="w-5 h-5" />,
      roles: [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.COWORKER]
    },
    {
      name: 'My Absence',
      href: '/absence',
      icon: <Calendar className="w-5 h-5" />,
      roles: [UserRole.EMPLOYEE, UserRole.COWORKER]
    },
    {
      name: 'My Absence',
      href: '/manager/absence',
      icon: <Calendar className="w-5 h-5" />,
      roles: [UserRole.MANAGER]
    },
    {
      name: 'Team Management',
      href: '/manager/team',
      icon: <Users className="w-5 h-5" />,
      roles: [UserRole.MANAGER]
    },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const getRoleSpecificItems = () => {
    switch (user.role) {
      case UserRole.MANAGER:
        return (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-900 to-blue-900 border border-green-700">
            <div className="text-xs font-medium text-green-200 mb-2 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Manager Access
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-300 leading-relaxed">
                • Full system access
              </div>
              <div className="text-xs text-gray-300 leading-relaxed">
                • Manage all profiles
              </div>
              <div className="text-xs text-gray-300 leading-relaxed">
                • Team absence management
              </div>
            </div>
          </div>
        );
      case UserRole.EMPLOYEE:
        return (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700">
            <div className="text-xs font-medium text-blue-200 mb-2 flex items-center">
              <User className="w-3 h-3 mr-1" />
              Employee Access
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-300 leading-relaxed">
                • Own profile & absence management
              </div>
            </div>
          </div>
        );
      case UserRole.COWORKER:
        return (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-700">
            <div className="text-xs font-medium text-purple-200 mb-2 flex items-center">
              <Briefcase className="w-3 h-3 mr-1" />
              Co-worker Access
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-300 leading-relaxed">
                • Public data & feedback access
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-gray-900 shadow-sm border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-lg font-semibold text-white">Menu</span>
        </div>

        {/* Role-specific info */}
        {getRoleSpecificItems()}

        {/* Navigation */}
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-900 text-blue-200 border-r-2 border-blue-600'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={`mr-3 ${
                  isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
