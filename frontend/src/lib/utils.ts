
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getUserAvatar(user?: { role?: string; avatarUrl?: string | null } | null) {
  if (user?.avatarUrl) return user.avatarUrl;
  const role = user?.role?.toUpperCase();
  if (role === 'ADMIN') return '/avatars/admin.png';
  if (role === 'COMMUNITY_LEADER' || role === 'LEADER') return '/avatars/leader.png';
  if (role === 'ORGANIZATION' || role === 'ORG') return '/avatars/org.png';
  return '/avatars/member.png';
}
