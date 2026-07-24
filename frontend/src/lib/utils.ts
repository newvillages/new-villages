
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function getUserAvatar(user?: { role?: string; avatarUrl?: string | null } | null) {
  const role = user?.role?.toUpperCase();
  let defaultAvatar = '/avatars/member.png';
  if (role === 'ADMIN') defaultAvatar = '/avatars/admin.png';
  else if (role === 'COMMUNITY_LEADER' || role === 'LEADER') defaultAvatar = '/avatars/leader.png';
  else if (role === 'ORGANIZATION' || role === 'ORG') defaultAvatar = '/avatars/org.png';

  if (user?.avatarUrl) {
    let url = user.avatarUrl;
    if (url.startsWith('http://localhost:8080')) {
      url = url.replace('http://localhost:8080', API_BASE_URL);
    }
    return url;
  }

  return defaultAvatar;
}
