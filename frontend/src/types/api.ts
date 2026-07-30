export type UserRole = 'MEMBER' | 'COMMUNITY_LEADER' | 'ORGANIZATION' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  country?: string;
  city?: string;
  preferredLanguage?: string;
  bio?: string;
  avatarUrl?: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  selectedCommunityId?: string;
  selectedCommunityName?: string;
  spokenLanguages: string[];
  acceptedTermsVersion?: string;
  acceptedTermsDate?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TermsVersionResponse {
  version: string;
  body: string;
  publishedAt: string;
}

export interface TermsStatusResponse {
  upToDate: boolean;
  currentVersion: string;
  acceptedVersion: string | null;
}

export interface CommunityCategory {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  tag?: string;
  description?: string;
  features?: string;
  active: boolean;
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  reason: string;
  details?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}
