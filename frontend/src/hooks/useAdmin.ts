import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import type { PageResponse } from '../types/api';
import type { CommunityCreationRequest, Community } from '../types/community';
import type { ReportResponse } from './useReports';

export interface AdminStats {
  totalUsers: number;
  totalCommunities: number;
  activeSubscriptions: number;
  openReports: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actorName: string;
  targetType: string | null;
  targetId: string | null;
  description: string | null;
  createdAt: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/api/admin/stats/overview'),
  });
}

export function useAdminUsers(search: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['admin', 'users', search, page, size],
    queryFn: () => api.get<PageResponse<AdminUser>>(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&size=${size}`),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.patch<void>(`/api/admin/users/${userId}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useReinstateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.patch<void>(`/api/admin/users/${userId}/reinstate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminLeaderApplications() {
  return useQuery({
    queryKey: ['admin', 'leader-applications'],
    queryFn: () => api.get<CommunityCreationRequest[]>('/api/admin/leader-applications'),
  });
}

export function useApproveLeaderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/admin/leader-applications/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useRejectLeaderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/admin/leader-applications/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useAdminCommunities() {
  return useQuery({
    queryKey: ['admin', 'communities'],
    queryFn: () => api.get<Community[]>('/api/admin/communities'),
  });
}

export function useAdminRemoveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/admin/communities/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'communities'] }),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get<ReportResponse[]>('/api/admin/reports'),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'REMOVE_CONTENT' | 'SUSPEND_USER' | 'DISMISS' }) =>
      api.post<void>(`/api/admin/reports/${id}/resolve`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => api.get<AdminSubscription[]>('/api/admin/subscriptions'),
  });
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => api.get<ActivityLog[]>('/api/admin/logs'),
  });
}

// --- Leader Removal ---
export function useRemoveLeaderRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.patch<void>(`/api/admin/users/${userId}/remove-leader`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

// --- Admin Broadcast ---
export function useAdminBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title?: string; message: string; targetCommunityIds?: string[] }) => api.post<void>('/api/admin/broadcast', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

// --- Categories ---
export interface CommunityCategory {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  createdAt: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<CommunityCategory[]>('/api/categories'),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.get<CommunityCategory[]>('/api/admin/categories'),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; iconName?: string }) =>
      api.post<CommunityCategory>('/api/admin/categories', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name: string; description?: string; iconName?: string }) =>
      api.put<CommunityCategory>(`/api/admin/categories/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/admin/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// --- Pricing Plans ---
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

export function usePricingPlans() {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: () => api.get<PricingPlan[]>('/api/pricing-plans'),
  });
}

export function useAdminPricingPlans() {
  return useQuery({
    queryKey: ['admin', 'pricing-plans'],
    queryFn: () => api.get<PricingPlan[]>('/api/admin/pricing-plans'),
  });
}

export function useCreatePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PricingPlan>) => api.post<PricingPlan>('/api/admin/pricing-plans', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing-plans'] }),
  });
}

export function useUpdatePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<PricingPlan> & { id: string }) =>
      api.put<PricingPlan>(`/api/admin/pricing-plans/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing-plans'] }),
  });
}

export function useDeletePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/admin/pricing-plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing-plans'] }),
  });
}

// --- Refund Requests ---
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

export function useLeaderRefundRequests() {
  return useQuery({
    queryKey: ['leader', 'refund-requests'],
    queryFn: () => api.get<RefundRequest[]>('/api/leader/refund-requests'),
  });
}

export function useSubmitRefundRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amount?: number; reason: string; details?: string }) =>
      api.post<RefundRequest>('/api/leader/refund-requests', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leader', 'refund-requests'] }),
  });
}

export function useAdminRefundRequests() {
  return useQuery({
    queryKey: ['admin', 'refund-requests'],
    queryFn: () => api.get<RefundRequest[]>('/api/admin/refund-requests'),
  });
}

export function useReviewRefundRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      api.post<void>(`/api/admin/refund-requests/${id}/${approve ? 'approve' : 'reject'}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'refund-requests'] }),
  });
}
