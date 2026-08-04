import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/apiClient';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const LAST_ACTIVITY_KEY = 'nv_last_activity_ts';

/**
 * Bridges apiClient's window events to real navigation/state changes.
 * Also monitors user activity and automatically logs out inactive users
 * after 15 minutes of idle time to protect user sessions.
 */
export function SessionBridge() {
  const navigate = useNavigate();
  const clearSession = useStore((s) => s.clearSession);
  const status = useStore((s) => s.status);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onSessionExpired = () => {
      clearSession();
      navigate('/login?reason=session_expired');
    };
    const onTermsRequired = () => {
      navigate('/re-consent');
    };

    window.addEventListener('auth:session-expired', onSessionExpired);
    window.addEventListener('auth:terms-required', onTermsRequired);
    return () => {
      window.removeEventListener('auth:session-expired', onSessionExpired);
      window.removeEventListener('auth:terms-required', onTermsRequired);
    };
  }, [navigate, clearSession]);

  // Inactivity Auto-Logout Tracker
  useEffect(() => {
    if (status !== 'authenticated') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const handleLogout = async () => {
      try {
        await api.post('/api/auth/logout');
      } catch {
        // Ignore logout network errors
      }
      clearSession();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      navigate('/login?reason=inactivity');
    };

    const resetTimer = () => {
      const now = Date.now();
      const lastTs = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
      
      // If returning to tab after >15 minutes of idle time
      if (lastTs > 0 && now - lastTs >= INACTIVITY_TIMEOUT_MS) {
        handleLogout();
        return;
      }

      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Initial check and setup
    resetTimer();

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      // Throttle updating activity timestamp to max once per 10 seconds
      const lastTs = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
      if (Date.now() - lastTs > 10000) {
        resetTimer();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetTimer();
      }
    };

    activityEvents.forEach((event) => window.addEventListener(event, handleUserActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach((event) => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, clearSession, navigate]);

  return null;
}
