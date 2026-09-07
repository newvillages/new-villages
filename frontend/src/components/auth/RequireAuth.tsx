import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { FullScreenLoader } from '../ui/FullScreenLoader';

export function RequireAuth({ children, redirectTo }: { children: ReactNode; redirectTo?: string }) {
  const status = useStore((s) => s.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <FullScreenLoader />;
  }
  if (status === 'guest') {
    const isCommunityPath = location.pathname.startsWith('/communities') || location.pathname.startsWith('/groupes');
    const target = redirectTo || (isCommunityPath ? '/register' : '/login');
    return <Navigate to={target} state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
