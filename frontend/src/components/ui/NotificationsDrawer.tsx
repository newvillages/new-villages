import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Mail, Calendar, Bell, Megaphone, Check, ChevronRight, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../lib/format';
import type { NotificationType, AppNotification } from '../../types/notification';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS: Record<NotificationType, React.ReactNode> = {
  MESSAGE: <MessageSquare size={16} className="text-blue-500" />,
  INVITATION: <Mail size={16} className="text-emerald-500" />,
  EVENT: <Calendar size={16} className="text-purple-500" />,
  ANNOUNCEMENT: <Bell size={16} className="text-amber-500" />,
  SYSTEM: <Megaphone size={16} className="text-slate-500" />,
};

const ACTION_LABELS: Record<NotificationType, string> = {
  MESSAGE: 'Ouvrir le message',
  INVITATION: "Voir l'invitation",
  EVENT: 'Voir la sortie',
  ANNOUNCEMENT: "Voir l'annonce",
  SYSTEM: 'Voir les détails',
};

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const navigate = useNavigate();
  const { data } = useNotifications(0, 30);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      markRead.mutate(notif.id);
    }
    onClose();

    switch (notif.type) {
      case 'MESSAGE':
        if (notif.relatedEntityId) {
          navigate('/messages', { state: { conversationId: notif.relatedEntityId } });
        } else {
          navigate('/messages');
        }
        break;

      case 'EVENT':
        if (notif.relatedEntityId) {
          navigate(`/events/${notif.relatedEntityId}`);
        } else {
          navigate('/events');
        }
        break;

      case 'INVITATION':
      case 'ANNOUNCEMENT':
        if (notif.relatedEntityId) {
          navigate(`/communities/${notif.relatedEntityId}`);
        } else {
          navigate('/communities');
        }
        break;

      case 'SYSTEM':
      default:
        navigate('/dashboard');
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-base text-slate-900 leading-tight">Notifications</h2>
                    {unreadCount > 0 ? (
                      <p className="text-xs text-slate-500">{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</p>
                    ) : (
                      <p className="text-xs text-slate-400">Vous êtes à jour</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAllRead.mutate()} 
                      className="text-xs text-primary hover:text-primary-dark hover:bg-primary/5 h-8 px-2.5 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck size={14} />
                      Tout marquer comme lu
                    </Button>
                  )}
                  <button 
                    onClick={onClose} 
                    className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-500 hover:text-slate-700 transition-colors"
                    aria-label="Fermer les notifications"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex p-0.5 bg-slate-200/60 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
                    filter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center flex items-center justify-center gap-1.5 ${
                    filter === 'unread'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Non lues</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-primary text-white text-[10px] rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-4 flex gap-3.5 items-start transition-all cursor-pointer group relative ${
                      !notif.isRead 
                        ? 'bg-blue-50/40 hover:bg-blue-50/80 border-l-4 border-l-primary' 
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 p-2 bg-slate-100 group-hover:bg-white rounded-xl shadow-xs transition-colors">
                      {ICONS[notif.type] || <Bell size={16} className="text-slate-500" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      {notif.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {notif.description}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="inline-flex items-center text-xs font-semibold text-primary group-hover:underline gap-1">
                          {ACTION_LABELS[notif.type] || 'Voir les détails'}
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>

                        {!notif.isRead && (
                          <button
                            title="Marquer comme lu"
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead.mutate(notif.id);
                            }}
                            className="p-1 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 px-4 text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <Bell size={24} className="opacity-60" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification pour le moment'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {filter === 'unread' 
                      ? 'Vous êtes parfaitement à jour ! Basculez sur « Toutes » pour voir vos notifications antérieures.' 
                      : 'Lorsque vous recevrez des messages, invitations ou sorties, ils apparaîtront ici.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

