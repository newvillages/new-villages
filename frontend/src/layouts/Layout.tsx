import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  PlusCircle,
  MessageSquare,
  UserCircle,
  Bell,
  Search,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn, getUserAvatar, getRoleLabel } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useLogout } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationsDrawer } from '../components/ui/NotificationsDrawer';
import { ToastContainer } from '../components/ui/ToastContainer';
import { ScrollToTopButton } from '../components/ui/ScrollToTopButton';
import { Footer } from '../components/layout/Footer';
import { AnimatePresence, motion } from 'framer-motion';

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const isAuthenticated = useStore((s) => s.status) === 'authenticated';
  const logout = useLogout();
  const role = currentUser?.role ?? 'guest';

  const canCreateEvent = role === 'COMMUNITY_LEADER' || role === 'ORGANIZATION' || role === 'ADMIN';
  const canCreateCommunity = role === 'COMMUNITY_LEADER' || role === 'ADMIN';

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  const { data: notificationsPage } = useNotifications(0, 20);
  const hasUnread = (notificationsPage?.content ?? []).some((n) => !n.isRead);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target as Node)) {
        setIsMobileProfileOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsMobileProfileOpen(false);
    setIsCreateMenuOpen(false);
  }, [pathname]);

  const isLeaderOrOrgOrAdmin = role === 'COMMUNITY_LEADER' || role === 'ORGANIZATION' || role === 'ADMIN';

  const mainNavItems = [
    isAuthenticated
      ? { label: 'Tableau de bord', icon: Home, href: '/dashboard' }
      : { label: 'Accueil', icon: Home, href: '/' },
    { label: 'Groupes', icon: Users, href: '/communities' },
    { label: 'Sorties', icon: Calendar, href: '/events' },
    ...(!isLeaderOrOrgOrAdmin ? [{ label: 'Abonnements', icon: Sparkles, href: '/pricing' }] : []),
    ...(!isAuthenticated ? [{ label: 'Contact', icon: Mail, href: '/contact' }] : []),
    ...(isAuthenticated ? [{ label: 'Messagerie', icon: MessageSquare, href: '/messages' }] : []),
  ];

  if (role === 'COMMUNITY_LEADER') {
    mainNavItems.push({ label: 'Organisateur', icon: Shield, href: '/leader-dashboard' });
  } else if (role === 'ORGANIZATION') {
    mainNavItems.push({ label: 'Page Org', icon: Users, href: '/org/me' });
  } else if (role === 'ADMIN') {
    mainNavItems.push({ label: 'Admin', icon: Shield, href: '/admin' });
  }

  let mobileRoleItem: { label: string; icon: typeof Shield; href: string } | null = null;
  if (role === 'COMMUNITY_LEADER') {
    mobileRoleItem = { label: 'Organisateur', icon: Shield, href: '/leader-dashboard' };
  } else if (role === 'ORGANIZATION') {
    mobileRoleItem = { label: 'Page Org', icon: Users, href: '/org/me' };
  } else if (role === 'ADMIN') {
    mobileRoleItem = { label: 'Admin', icon: Shield, href: '/admin' };
  }

  const mobileNavItems = [
    isAuthenticated
      ? { label: 'Accueil', icon: Home, href: '/dashboard', isAction: false }
      : { label: 'Accueil', icon: Home, href: '/', isAction: false },
    { label: 'Groupes', icon: Users, href: '/communities', isAction: false },
    { label: 'Sorties', icon: Calendar, href: '/events', isAction: false },
    ...(!isLeaderOrOrgOrAdmin ? [{ label: 'Forfaits', icon: Sparkles, href: '/pricing', isAction: false }] : []),
    ...(canCreateEvent
      ? [{ label: 'Créer', icon: PlusCircle, href: '/create-event', isAction: true }]
      : []),
    ...(isAuthenticated ? [{ label: 'Messages', icon: MessageSquare, href: '/messages', isAction: false }] : []),
    ...(mobileRoleItem ? [{ ...mobileRoleItem, isAction: false }] : []),
    { label: 'Profil', icon: UserCircle, href: '/profile', isAction: false },
  ];

  const Logo = () => (
    <Link to="/" className="flex items-center shrink-0">
      <img src="/logo-bouffe-amitie.png" alt="Bouffe &amp; Amitié" className="h-8 sm:h-10 lg:h-12 w-auto object-contain" />
    </Link>
  );

  const isAuthPage = ['/register', '/login', '/verify-email', '/onboarding', '/forgot-password', '/reset-password'].includes(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full overflow-x-hidden">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#2C1810] w-full overflow-x-hidden font-body">
      {/* Desktop Top Navigation Bar */}
      <header className="hidden md:flex h-16 lg:h-20 bg-white/95 backdrop-blur-md border-b border-[#EFE6DD] items-center justify-between px-2.5 lg:px-5 xl:px-8 sticky top-0 z-40 shadow-xs w-full">
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 xl:gap-5 min-w-0">
          <Logo />

          {/* Main Navigation Links */}
          <nav className="flex items-center gap-0.5 md:gap-1 lg:gap-1.5 shrink-0">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-2 lg:px-3 py-1.5 rounded-full font-bold transition-all duration-200 text-xs xl:text-sm whitespace-nowrap shrink-0',
                    isActive ? 'bg-[#1E4D2B] text-white shadow-sm' : 'text-[#52433B] hover:bg-[#E8F3EB] hover:text-[#1E4D2B]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0 ml-1">
          {/* Global Search */}
          <div className="flex items-center bg-[#FAF5EF] rounded-full px-2.5 py-1.5 lg:px-3.5 lg:py-2 w-24 md:w-28 lg:w-36 xl:w-44 transition-all focus-within:w-36 lg:focus-within:w-48 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E86225]/20 focus-within:shadow-sm border border-[#EFE6DD] focus-within:border-[#E86225] shrink-0">
            <Search size={14} className="text-slate-400 mr-1 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none focus:outline-none text-xs w-full text-[#2C1810] placeholder-slate-400 font-medium"
            />
          </div>

          {/* "+ Create" Dropdown Menu */}
          {(canCreateEvent || canCreateCommunity) && (
            <div className="relative shrink-0" ref={createMenuRef}>
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E86225] text-white hover:bg-[#D0521B] transition-colors font-bold text-xs shadow-sm whitespace-nowrap"
              >
                <PlusCircle size={15} />
                <span>Créer</span>
                <ChevronDown size={14} className={cn('transition-transform duration-200', isCreateMenuOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {isCreateMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right p-2 space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Sparkles size={13} className="text-[#E86225]" />
                      <span>Espace de création</span>
                    </div>

                    {canCreateEvent && (
                      <Link
                        to="/create-event"
                        className="flex items-start gap-3 p-2.5 hover:bg-[#FDF0E9] rounded-xl transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FDF0E9] text-[#E86225] flex items-center justify-center shrink-0 group-hover:bg-[#E86225] group-hover:text-white transition-colors">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#2C1810] group-hover:text-[#E86225]">Organiser une sortie</p>
                          <p className="text-[11px] text-[#52433B]">Proposer une rencontre au restaurant</p>
                        </div>
                      </Link>
                    )}

                    {canCreateCommunity && (
                      <Link
                        to="/create-community"
                        className="flex items-start gap-3 p-2.5 hover:bg-[#E8F3EB] rounded-xl transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center shrink-0 group-hover:bg-[#1E4D2B] group-hover:text-white transition-colors">
                          <PlusCircle size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#2C1810] group-hover:text-[#1E4D2B]">Créer un groupe</p>
                          <p className="text-[11px] text-[#52433B]">Lancer un groupe dans votre quartier</p>
                        </div>
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="h-6 w-px bg-slate-200 mx-0.5 hidden xl:block" />

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 text-slate-500 hover:bg-[#FAF5EF] hover:text-[#E86225] rounded-full transition-colors shrink-0"
              >
                <Bell size={20} />
                {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative shrink-0" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 hover:bg-slate-50 rounded-full pl-1 pr-2 py-1 transition-colors border border-transparent hover:border-slate-200"
                >
                  <img
                    src={getUserAvatar(currentUser)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/member.png';
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    alt="avatar"
                  />
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-slate-50 bg-[#FAF5EF]">
                        <p className="font-bold text-[#2C1810] truncate">{currentUser?.fullName || 'Membre'}</p>
                        <p className="text-xs text-[#E86225] font-semibold mt-0.5">{getRoleLabel(role)}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-[#FDF0E9] hover:text-[#E86225] rounded-xl transition-colors">
                          <UserCircle size={16} /> Mon Profil
                        </Link>

                        {canCreateEvent && (
                          <Link to="/create-event" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-[#FDF0E9] hover:text-[#E86225] rounded-xl transition-colors">
                            <Calendar size={16} className="text-[#E86225]" /> Organiser une sortie
                          </Link>
                        )}

                        {canCreateCommunity && (
                          <Link to="/create-community" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-[#E8F3EB] hover:text-[#1E4D2B] rounded-xl transition-colors">
                            <PlusCircle size={16} className="text-[#1E4D2B]" /> Créer un groupe
                          </Link>
                        )}

                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-slate-50 hover:text-[#2C1810] rounded-xl transition-colors">
                          <Settings size={16} /> Paramètres
                        </Link>

                        {!isLeaderOrOrgOrAdmin && (
                          <Link to="/pricing" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#E86225] hover:bg-[#FDF0E9] rounded-xl transition-colors font-bold">
                            <Sparkles size={16} className="text-[#E86225]" /> Modifier mon forfait
                          </Link>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-50">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
                          <LogOut size={16} /> Se déconnecter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/login" className="px-4 py-2 rounded-full text-xs lg:text-sm font-bold border border-[#E86225] text-[#E86225] hover:bg-[#FDF0E9] transition-colors whitespace-nowrap">
                Se connecter
              </Link>
              <Link to="/register" className="px-5 py-2 rounded-full text-xs lg:text-sm font-bold bg-[#E86225] text-white hover:bg-[#D0521B] transition-colors shadow-sm whitespace-nowrap">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Topbar */}
      <header className="md:hidden flex h-14 bg-white border-b border-slate-200 items-center justify-between px-3 sm:px-4 sticky top-0 z-40 w-full shrink-0">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell size={18} />
                {hasUnread && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>

              {/* Mobile Profile & Settings Menu Trigger */}
              <div className="relative" ref={mobileProfileRef}>
                <button
                  onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                  className="flex items-center gap-1 p-0.5 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
                >
                  <img
                    src={getUserAvatar(currentUser)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/member.png';
                    }}
                    className="w-7 h-7 rounded-full object-cover"
                    alt="avatar"
                  />
                  <ChevronDown size={12} className="text-slate-500 mr-0.5" />
                </button>

                <AnimatePresence>
                  {isMobileProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-3 border-b border-slate-50 bg-[#FAF5EF]">
                        <p className="font-bold text-xs text-[#2C1810] truncate">{currentUser?.fullName || 'Membre'}</p>
                        <p className="text-[11px] text-[#E86225] font-semibold mt-0.5">{getRoleLabel(role)}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-[#FDF0E9] rounded-xl transition-colors">
                          <UserCircle size={15} /> Mon Profil
                        </Link>
                        <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-slate-50 rounded-xl transition-colors">
                          <Settings size={15} className="text-[#E86225]" /> Paramètres
                        </Link>
                        {!isLeaderOrOrgOrAdmin && (
                          <Link to="/pricing" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#E86225] hover:bg-[#FDF0E9] rounded-xl transition-colors">
                            <Sparkles size={15} className="text-[#E86225]" /> Choisir un forfait
                          </Link>
                        )}

                        {canCreateEvent && (
                          <Link to="/create-event" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-[#FDF0E9] rounded-xl transition-colors">
                            <Calendar size={15} className="text-[#E86225]" /> Organiser une sortie
                          </Link>
                        )}

                        {canCreateCommunity && (
                          <Link to="/create-community" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#52433B] hover:bg-[#E8F3EB] rounded-xl transition-colors">
                            <PlusCircle size={15} className="text-[#1E4D2B]" /> Créer un groupe
                          </Link>
                        )}
                      </div>
                      <div className="p-1.5 border-t border-slate-50">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
                          <LogOut size={15} /> Se déconnecter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link to="/login" className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#E86225] text-[#E86225] hover:bg-[#FDF0E9] transition-colors">
                Se connecter
              </Link>
              <Link to="/register" className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E86225] text-white hover:bg-[#D0521B] transition-colors shadow-sm whitespace-nowrap">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-1 sm:px-2 z-50 pb-safe shadow-lg">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <div key={item.href} className="relative -top-5 shrink-0">
                <Link to={item.href} className="w-12 h-12 bg-[#E86225] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#D0521B] transition-colors">
                  <Icon size={24} />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-0.5 transition-colors px-1',
                isActive ? 'text-[#E86225] font-bold' : 'text-slate-400'
              )}
            >
              <Icon size={19} />
              <span className="text-[9px] sm:text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Global Sticky Scroll To Top Button */}
      <ScrollToTopButton />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default Layout;
