export enum UserRole {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  COWORKER = 'coworker'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  profileImage?: string;
  bio?: string;
  skills: string[];
  email?: string;
  phone?: string;
  salary?: number;
  startDate?: string;
  employeeId?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  performanceRating?: number;
  certifications?: string[];
  workHistory?: {
    company: string;
    position: string;
    duration: string;
  }[];
  feedback: Feedback[];
  feedbackCount?: number; // Count of feedback received (for browse view)
  absenceRequests: AbsenceRequest[];
}

export interface Feedback {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string; // Add recipient ID for role-based filtering
  content: string;
  enhancedContent?: string;
  isEnhanced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AbsenceRequest {
  id: string;
  employeeId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: AbsenceStatus;
  createdAt: string;
  updatedAt: string;
}

export enum AbsenceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface AbsenceStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
}

export interface VacationDaysData {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  loading: boolean;
  error: string | null;
}