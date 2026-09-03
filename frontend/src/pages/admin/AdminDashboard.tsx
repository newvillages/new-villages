import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BarChart2, Flag, CreditCard, FileText, Shield,
  UserX, CheckCircle, XCircle, Search, Loader2, Image as ImageIcon,
  Radio, Tag, DollarSign, Plus, Edit2, Trash2, Send, Menu, X, ArrowLeft, Copy, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';
import {
  useAdminCommunities,
  useAdminLeaderApplications,
  useAdminLogs,
  useAdminRemoveCommunity,
  useAdminReports,
  useAdminStats,
  useAdminSubscriptions,
  useAdminUsers,
  useApproveLeaderApplication,
  useReinstateUser,
  useRejectLeaderApplication,
  useResolveReport,
  useSuspendUser,
  useRemoveLeaderRole,
  useAdminBroadcast,
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAdminPricingPlans,
  useCreatePricingPlan,
  useUpdatePricingPlan,
  useDeletePricingPlan,
  useAdminRefundRequests,
  useReviewRefundRequest,
  useAdminInteracPayments,
  useConfirmInteracPayment,
  type InteracPayment,
  type AdminStats,
  type CommunityCategory,
  type PricingPlan,
} from '../../hooks/useAdmin';
import type { ReportResponse } from '../../hooks/useReports';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';

type AdminSection =
  | 'overview'
  | 'interac'
  | 'broadcast'
  | 'users'
  | 'applications'
  | 'communities'
  | 'categories'
  | 'pricing'
  | 'refunds'
  | 'reports'
  | 'subscriptions'
  | 'logs';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f59e0b',
  REVIEWING: '#3b82f6',
  RESOLVED: '#9ca3af',
};

const StatTile = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) => (
  <Card className="rounded-2xl border-[#EFE6DD] shadow-sm bg-white overflow-hidden">
    <CardContent className="p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0', color)}>
        <Icon size={20} className="text-white sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-heading font-bold text-gray-900 truncate">{value}</p>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-tight">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    DEACTIVATED: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-amber-100 text-amber-700',
    REVIEWING: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-700',
    PAST_DUE: 'bg-amber-100 text-amber-700',
    PENDING: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', colors[status] || 'bg-gray-100')}>{status.toLowerCase().replace('_', ' ')}</span>;
};

export function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = useAdminStats();
  const reports = useAdminReports();
  const leaderApps = useAdminLeaderApplications();
  const refunds = useAdminRefundRequests();
  const interacPayments = useAdminInteracPayments();

  const pendingInteracCount = (interacPayments.data ?? []).filter((p) => p.status === 'PENDING').length;
  const openReportsCount = (reports.data ?? []).filter((r) => r.status === 'OPEN').length;
  const pendingRefundsCount = (refunds.data ?? []).filter((r) => r.status === 'PENDING').length;
  const pendingAppsCount = leaderApps.data?.length ?? 0;
  const totalAlerts = pendingInteracCount + openReportsCount + pendingRefundsCount + pendingAppsCount;

  const sidebarLinks: { id: AdminSection; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Aperçu général', icon: BarChart2 },
    { id: 'interac', label: 'Virements Interac', icon: Send, badge: pendingInteracCount },
    { id: 'broadcast', label: 'Annonce générale', icon: Radio },
    { id: 'users', label: 'Gestion des membres', icon: Users },
    { id: 'applications', label: 'Candidatures d\'organisateurs', icon: CheckCircle, badge: pendingAppsCount },
    { id: 'communities', label: 'Groupes d\'arrondissements', icon: Users },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'pricing', label: 'Tarifs & Formules', icon: DollarSign },
    { id: 'refunds', label: 'Demandes de remboursement', icon: CreditCard, badge: pendingRefundsCount },
    { id: 'reports', label: 'File des signalements', icon: Flag, badge: openReportsCount },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'logs', label: 'Journal d\'activités', icon: FileText },
  ];

  const currentSectionMeta = sidebarLinks.find((l) => l.id === section) || sidebarLinks[0];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen md:h-screen flex flex-col md:flex-row bg-gray-50 md:overflow-hidden relative font-body w-full">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-72 max-w-[84vw] bg-gray-900 text-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E86225]/20 text-[#E86225] flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm leading-tight">Administration</h2>
              <p className="text-[10px] text-gray-400">Panneau de contrôle</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-2 bg-gray-950/40 border-b border-gray-800/80">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={14} /> Retour à l'application
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = section === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#E86225] text-white font-bold shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                <span className="flex-1">{link.label}</span>
                {!!link.badge && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex md:w-64 bg-gray-900 text-white flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-[#E86225]" />
            <h2 className="font-heading font-bold text-lg">Administration</h2>
          </div>
          <Link to="/dashboard" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-1 transition-colors">
            <span>←</span> Retour à l'application
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = section === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setSection(link.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                  isActive ? 'bg-[#E86225] text-white font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                <span className="flex-1">{link.label}</span>
                {!!link.badge && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{link.badge}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden w-full">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-gray-900 text-white px-3 py-2.5 flex items-center justify-between border-b border-gray-800 shrink-0 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors relative cursor-pointer"
              aria-label="Ouvrir le menu d'administration"
            >
              <Menu size={22} />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-gray-900" />
              )}
            </button>
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E86225]/20 text-[#E86225] flex items-center justify-center shrink-0">
                <currentSectionMeta.icon size={15} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-bold">Menu actif</span>
                <h2 className="text-xs font-extrabold text-white truncate max-w-[150px] sm:max-w-[260px]">
                  {currentSectionMeta.label}
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-xs font-bold text-[#E86225] bg-[#E86225]/10 hover:bg-[#E86225]/20 px-2.5 py-1 rounded-lg transition-colors border border-[#E86225]/30"
            >
              Menus ({sidebarLinks.length})
            </button>
            <Link
              to="/dashboard"
              className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded-lg bg-gray-800 shrink-0 border border-gray-700"
            >
              Quitter
            </Link>
          </div>
        </header>

        {/* Mobile Horizontal Quick-Selector Pill Strip */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 px-3 bg-white border-b border-[#EFE6DD] shrink-0 no-scrollbar shadow-xs sticky top-12 z-20">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = section === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setSection(link.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-xs',
                  isActive
                    ? 'bg-[#E86225] text-white shadow-sm ring-1 ring-[#E86225]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Icon size={13} className={isActive ? 'text-white' : 'text-gray-500'} />
                <span>{link.label}</span>
                {!!link.badge && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-extrabold',
                    isActive ? 'bg-white text-[#E86225]' : 'bg-red-500 text-white'
                  )}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Admin Content Area (with pb-36 for mobile bottom navigation clearance) */}
        <main className="flex-1 p-3.5 sm:p-6 pb-36 md:pb-8 bg-[#FDFBF7] font-body text-[#2C1810] md:overflow-y-auto w-full">
          {section === 'overview' && (
            <OverviewSection
              stats={stats.data}
              reports={reports.data ?? []}
              onNavigate={(s) => setSection(s)}
              pendingInterac={pendingInteracCount}
              pendingApps={pendingAppsCount}
              pendingRefunds={pendingRefundsCount}
              openReports={openReportsCount}
            />
          )}
          {section === 'interac' && <InteracSection onBack={() => setSection('overview')} />}
          {section === 'broadcast' && <BroadcastSection onBack={() => setSection('overview')} />}
          {section === 'users' && <UsersSection search={userSearch} setSearch={setUserSearch} onBack={() => setSection('overview')} />}
          {section === 'applications' && <ApplicationsSection onBack={() => setSection('overview')} />}
          {section === 'communities' && <CommunitiesSection onBack={() => setSection('overview')} />}
          {section === 'categories' && <CategoriesSection onBack={() => setSection('overview')} />}
          {section === 'pricing' && <PricingSection onBack={() => setSection('overview')} />}
          {section === 'refunds' && <RefundsSection onBack={() => setSection('overview')} />}
          {section === 'reports' && <ReportsSection onBack={() => setSection('overview')} />}
          {section === 'subscriptions' && <SubscriptionsSection onBack={() => setSection('overview')} />}
          {section === 'logs' && <LogsSection onBack={() => setSection('overview')} />}
        </main>
      </div>
    </div>
  );
}

function OverviewSection({ stats, reports, onNavigate, pendingInterac, pendingApps, pendingRefunds, openReports }: { stats: AdminStats | undefined; reports: ReportResponse[] | undefined; onNavigate: (s: AdminSection) => void; pendingInterac: number; pendingApps: number; pendingRefunds: number; openReports: number; }) {
  const reportsByStatus = [
    { status: 'Ouvert (OPEN)', rawStatus: 'OPEN' },
    { status: 'En révision (REVIEWING)', rawStatus: 'REVIEWING' },
    { status: 'Résolu (RESOLVED)', rawStatus: 'RESOLVED' },
  ].map((item) => ({
    status: item.status,
    count: (reports ?? []).filter((r) => r.status === item.rawStatus).length,
  }));

  const quickModules: { id: AdminSection; label: string; desc: string; icon: typeof Users; color: string; badge?: number }[] = [
    { id: 'interac', label: 'Virements Interac', desc: 'Valider les 20 $ adhésions & inscriptions', icon: Send, color: 'bg-emerald-600', badge: pendingInterac },
    { id: 'users', label: 'Gestion des membres', desc: 'Comptes, rôles et statuts des membres', icon: Users, color: 'bg-[#E86225]' },
    { id: 'applications', label: 'Candidatures Leaders', desc: 'Demandes de création de groupe', icon: CheckCircle, color: 'bg-blue-600', badge: pendingApps },
    { id: 'communities', label: 'Groupes d\'arrondissements', desc: 'Gérer les communautés locales', icon: Users, color: 'bg-[#1E4D2B]' },
    { id: 'categories', label: 'Catégories', desc: 'Arrondissements et thèmes culinaires', icon: Tag, color: 'bg-teal-600' },
    { id: 'pricing', label: 'Tarifs & Formules', desc: 'Gestion des prix d\'abonnement', icon: DollarSign, color: 'bg-indigo-600' },
    { id: 'refunds', label: 'Demandes de remboursement', desc: 'File d\'attente des remboursements', icon: CreditCard, color: 'bg-amber-600', badge: pendingRefunds },
    { id: 'reports', label: 'File des signalements', desc: 'Modération des contenus et abus', icon: Flag, color: 'bg-red-600', badge: openReports },
    { id: 'subscriptions', label: 'Abonnements & Revenus', desc: 'Forfaits actifs et rentrées', icon: CreditCard, color: 'bg-purple-600' },
    { id: 'broadcast', label: 'Annonce générale', desc: 'Diffuser un message officiel', icon: Radio, color: 'bg-orange-600' },
    { id: 'logs', label: 'Journal d\'activités', desc: 'Audit des actions administratives', icon: FileText, color: 'bg-gray-700' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Aperçu de la plateforme</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Indicateurs clés et santé de Bouffe &amp; Amitié</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatTile label="Membres inscrits" value={stats?.totalUsers ?? '—'} icon={Users} color="bg-[#E86225]" />
        <StatTile label="Groupes d'arrondissements" value={stats?.totalCommunities ?? '—'} icon={Users} color="bg-[#1E4D2B]" />
        <StatTile label="Abonnements actifs" value={stats?.activeSubscriptions ?? '—'} icon={CreditCard} color="bg-purple-600" />
        <StatTile label="Signalements ouverts" value={stats?.openReports ?? '—'} icon={Flag} color="bg-red-600" />
      </div>

      {/* Modules d'accès direct sur mobile et desktop */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-heading font-bold text-[#2C1810]">Modules d'administration</h2>
          <span className="text-[11px] text-gray-500">11 modules disponibles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {quickModules.map((m) => (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className="flex items-center justify-between p-3.5 bg-white hover:bg-[#FDF0E9]/50 rounded-2xl border border-[#EFE6DD] shadow-xs text-left transition-all group cursor-pointer hover:border-[#E86225]/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs', m.color)}>
                  <m.icon size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#E86225] transition-colors truncate">
                    {m.label}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{m.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {!!m.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                    {m.badge}
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#E86225] group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white rounded-2xl sm:rounded-3xl border border-[#EFE6DD] shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base sm:text-lg text-[#2C1810]">Signalements par statut</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reportsByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {reportsByStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function BroadcastSection({ onBack }: { onBack?: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetMode, setTargetMode] = useState<'ALL' | 'SELECT' | 'EXCLUDE'>('ALL');
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [searchCommunity, setSearchCommunity] = useState('');

  const { data: communities } = useAdminCommunities();
  const activeCommunities = (communities ?? []).filter((c) => c.status === 'ACTIVE');

  const broadcastMutation = useAdminBroadcast();

  const handleToggleCommunity = (id: string) => {
    setSelectedCommunityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCommunityIds(activeCommunities.map((c) => c.id));
  };

  const handleClearAll = () => {
    setSelectedCommunityIds([]);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (targetMode === 'SELECT' && selectedCommunityIds.length === 0) {
      toast.info('Please select at least one community to receive the broadcast.');
      return;
    }

    const payload = {
      title: title.trim() || undefined,
      message,
      targetCommunityIds: targetMode === 'SELECT' ? selectedCommunityIds : undefined,
      excludedCommunityIds: targetMode === 'EXCLUDE' ? selectedCommunityIds : undefined,
    };

    broadcastMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Admin broadcast announcement published successfully!');
        setTitle('');
        setMessage('');
        setSelectedCommunityIds([]);
        setTargetMode('ALL');
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Failed to send broadcast.'),
    });
  };

  const filteredCommunities = activeCommunities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCommunity.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchCommunity.toLowerCase()))
  );

  const recipientCount =
    targetMode === 'ALL'
      ? activeCommunities.length
      : targetMode === 'SELECT'
      ? selectedCommunityIds.length
      : Math.max(0, activeCommunities.length - selectedCommunityIds.length);

  return (
    <div className="space-y-4 max-w-3xl">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Annonce générale</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Diffusez une communication officielle aux groupes actifs de la plateforme.
        </p>
      </div>

      <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleBroadcast} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Announcement Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Platform Upgrade, System Guidelines Update, Community Event..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Corps de l'annonce générale *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your platform announcement here. This message will be published to target community feeds and sent as system notifications..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            {/* Target Mode Selector */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700">Target Community Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'ALL', label: 'All Active Groups', desc: `All ${activeCommunities.length} communities` },
                  { id: 'SELECT', label: 'Select Specific Groups', desc: 'Target chosen communities' },
                  { id: 'EXCLUDE', label: 'Exclude Specific Groups', desc: 'Exclude chosen communities' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setTargetMode(mode.id as typeof targetMode);
                      setSelectedCommunityIds([]);
                    }}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all',
                      targetMode === mode.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="text-xs font-bold text-gray-900">{mode.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Multi-Select Grid when SELECT or EXCLUDE */}
            {targetMode !== 'ALL' && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">
                    {targetMode === 'SELECT'
                      ? `Select Communities to Include (${selectedCommunityIds.length} selected)`
                      : `Select Communities to Exclude (${selectedCommunityIds.length} excluded)`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-gray-500 font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={searchCommunity}
                  onChange={(e) => setSearchCommunity(e.target.value)}
                  placeholder="Filter communities by name or category..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                  {filteredCommunities.map((community) => {
                    const isSelected = selectedCommunityIds.includes(community.id);
                    return (
                      <label
                        key={community.id}
                        className={cn(
                          'flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors bg-white',
                          isSelected ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCommunity(community.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{community.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{community.category || 'General'}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">
                Sera diffusé auprès de <strong>{recipientCount}</strong> {recipientCount === 1 ? 'groupe actif' : 'groupes actifs'}
              </span>
              <Button type="submit" className="bg-[#E86225] hover:bg-[#D0521B] text-white flex items-center justify-center gap-2 font-bold py-2.5 px-4 w-full sm:w-auto" disabled={broadcastMutation.isPending}>
                <Send size={16} />
                {broadcastMutation.isPending ? 'Envoi en cours…' : `Diffuser l'annonce`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSection({ search, setSearch, onBack }: { search: string; setSearch: (v: string) => void; onBack?: () => void }) {
  const { data, isLoading } = useAdminUsers(search);
  const suspend = useSuspendUser();
  const reinstate = useReinstateUser();
  const removeLeader = useRemoveLeaderRole();

  const handleRemoveLeader = (userId: string, name: string) => {
    if (confirm(`Voulez-vous vraiment retirer le rôle d'organisateur de groupe à ${name} ? Il sera rétrogradé au statut de MEMBRE.`)) {
      removeLeader.mutate(userId, {
        onSuccess: () => toast.success(`Rôle Leader retiré pour ${name}.`),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible de retirer le rôle Leader.'),
      });
    }
  };

  const users = data?.content ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Gestion des membres</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Recherchez et gérez les comptes, rôles et statuts</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-3 sm:p-4 flex items-center gap-2.5">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou courriel..."
          className="flex-1 text-xs sm:text-sm focus:outline-none bg-transparent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <Users className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-700">Aucun membre trouvé.</p>
        </div>
      ) : (
        <>
          {/* Mobile User Cards (< md) */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <Card key={user.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-snug">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <StatusBadge status={user.accountStatus} />
                </div>

                <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl p-2.5">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Rôle</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {user.role.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Ville</span>
                    <span className="font-semibold text-gray-800">{user.city || '—'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Inscrit le</span>
                    <span className="text-gray-600 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  {user.accountStatus === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => suspend.mutate(user.id)}
                      disabled={suspend.isPending}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs flex-1 justify-center"
                    >
                      <UserX size={14} className="mr-1" /> Suspendre
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => reinstate.mutate(user.id)}
                      disabled={reinstate.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1 justify-center"
                    >
                      <CheckCircle size={14} className="mr-1" /> Réactiver
                    </Button>
                  )}

                  {user.role === 'COMMUNITY_LEADER' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveLeader(user.id, user.fullName)}
                      disabled={removeLeader.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs w-full justify-center"
                    >
                      Rétrograder au rang de membre
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[650px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    {['Utilisateur', 'Rôle', 'Ville', 'Rejoint le', 'Statut', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{user.fullName}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize font-medium">{user.role.toLowerCase().replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-600">{user.city || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.accountStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.accountStatus === 'ACTIVE' ? (
                            <button
                              onClick={() => suspend.mutate(user.id)}
                              disabled={suspend.isPending}
                              className="text-xs text-amber-600 hover:text-amber-800 font-medium cursor-pointer"
                            >
                              <UserX size={14} className="inline mr-1" />
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => reinstate.mutate(user.id)}
                              disabled={reinstate.isPending}
                              className="text-xs text-green-600 hover:text-green-800 font-medium cursor-pointer"
                            >
                              <CheckCircle size={14} className="inline mr-1" />
                              Reinstate
                            </button>
                          )}
                          {user.role === 'COMMUNITY_LEADER' && (
                            <button
                              onClick={() => handleRemoveLeader(user.id, user.fullName)}
                              disabled={removeLeader.isPending}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                            >
                              Remove Leader Role
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ApplicationsSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminLeaderApplications();
  const approve = useApproveLeaderApplication();
  const reject = useRejectLeaderApplication();

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Candidatures d'organisateurs</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Demandes de création de groupe et statut Leader</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <CheckCircle className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-700">Aucune candidature d'organisateur en attente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((app) => (
            <Card key={app.id} className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {app.coverImageUrl ? (
                    <img src={app.coverImageUrl} alt={app.proposedName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{app.applicantName}</p>
                    <p className="text-xs sm:text-sm text-primary font-semibold">{app.proposedName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {app.city} • Déposée le {new Date(app.createdAt).toLocaleDateString('fr-CA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-end shrink-0">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs flex-1 sm:flex-none justify-center" onClick={() => reject.mutate(app.id)} disabled={reject.isPending}>
                    <XCircle size={14} className="mr-1" /> Rejeter
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1 sm:flex-none justify-center font-bold" onClick={() => approve.mutate(app.id)} disabled={approve.isPending}>
                    <CheckCircle size={14} className="mr-1" /> Approuver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CommunitiesSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminCommunities();
  const removeCommunity = useAdminRemoveCommunity();

  const communities = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Groupes d'arrondissements</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Gestion des groupes, organisateurs et statuts</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Aucun groupe trouvé.</p>
        </div>
      ) : (
        <>
          {/* Mobile Community Cards (< md) */}
          <div className="md:hidden space-y-3">
            {communities.map((c) => (
              <Card key={c.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {c.category || 'Arrondissement'}
                    </span>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl p-2.5">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Organisateur</span>
                    <span className="font-semibold text-gray-800">{c.leaderName || 'Non assigné'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Membres</span>
                    <span className="font-extrabold text-sm text-[#1E4D2B]">{c.memberCount}</span>
                  </div>
                </div>

                {c.status !== 'ARCHIVED' && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment archiver ou supprimer le groupe « ${c.name} » ?`)) {
                          removeCommunity.mutate(c.id);
                        }
                      }}
                      disabled={removeCommunity.isPending}
                      className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 justify-center"
                    >
                      <Trash2 size={13} className="mr-1" /> Supprimer le groupe
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[650px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    {['Groupe', 'Catégorie', 'Membres', 'Organisateur', 'Statut', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {communities.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.category || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.memberCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{c.leaderName || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        {c.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => removeCommunity.mutate(c.id)}
                            disabled={removeCommunity.isPending}
                            className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CategoriesSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CommunityCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEdit = (cat: CommunityCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCat.mutate(
        { id: editingCategory.id, name, description },
        {
          onSuccess: () => {
            toast.success('Catégorie mise à jour !');
            setModalOpen(false);
          },
        }
      );
    } else {
      createCat.mutate(
        { name, description },
        {
          onSuccess: () => {
            toast.success('Catégorie créée !');
            setModalOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la catégorie « ${catName} » ?`)) {
      deleteCat.mutate(id, {
        onSuccess: () => toast.success(`Catégorie « ${catName} » supprimée.`),
      });
    }
  };

  const categories = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Catégories de groupes</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Arrondissements et thématiques culinaires</p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5 self-start sm:self-auto font-bold bg-[#E86225] hover:bg-[#D0521B] text-white">
          <Plus size={16} /> Ajouter une catégorie
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Aucune catégorie configurée.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="md:hidden space-y-3">
            {categories.map((cat) => (
              <Card key={cat.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                  <span className="text-[11px] text-gray-400">
                    {new Date(cat.createdAt).toLocaleDateString('fr-CA')}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">{cat.description}</p>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(cat)}
                    className="flex-1 text-xs justify-center"
                  >
                    <Edit2 size={13} className="mr-1" /> Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50 justify-center"
                  >
                    <Trash2 size={13} className="mr-1" /> Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[550px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    {['Name', 'Description', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-md">{cat.description || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(cat.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(cat)} className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                            <Edit2 size={14} className="inline mr-1" /> Edit
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-600 font-semibold hover:underline cursor-pointer">
                            <Trash2 size={14} className="inline mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={createCat.isPending || updateCat.isPending}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PricingSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminPricingPlans();
  const createPlan = useCreatePricingPlan();
  const updatePlan = useUpdatePricingPlan();
  const deletePlan = useDeletePricingPlan();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    price: '10.00',
    currency: 'CAD',
    billingPeriod: 'monthly',
    tag: '',
    description: '',
    features: '',
  });

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ code: '', name: '', price: '10.00', currency: 'CAD', billingPeriod: 'monthly', tag: '', description: '', features: '' });
    setModalOpen(true);
  };

  const openEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setForm({
      code: plan.code,
      name: plan.name,
      price: plan.price.toString(),
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      tag: plan.tag || '',
      description: plan.description || '',
      features: plan.features || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      name: form.name,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      billingPeriod: form.billingPeriod,
      tag: form.tag || undefined,
      description: form.description || undefined,
      features: form.features || undefined,
      active: true,
    };

    if (editingPlan) {
      updatePlan.mutate(
        { id: editingPlan.id, ...payload },
        {
          onSuccess: () => {
            toast.success('Pricing plan updated!');
            setModalOpen(false);
          },
        }
      );
    } else {
      createPlan.mutate(payload, {
        onSuccess: () => {
          toast.success('Pricing plan created!');
          setModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: string, planName: string) => {
    if (confirm(`Are you sure you want to delete pricing plan "${planName}"?`)) {
      deletePlan.mutate(id, {
        onSuccess: () => toast.success(`Pricing plan "${planName}" deleted.`),
      });
    }
  };

  const plans = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Tarifs &amp; Formules</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Gestion des forfaits d'abonnement et fonctionnalités</p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5 self-start sm:self-auto font-bold bg-[#E86225] hover:bg-[#D0521B] text-white">
          <Plus size={16} /> Ajouter une formule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Aucune formule configurée.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="md:hidden space-y-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs uppercase bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md">
                      {plan.code}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1">{plan.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-emerald-600 block">
                      ${plan.price} {plan.currency}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">/ {plan.billingPeriod}</span>
                  </div>
                </div>

                {plan.tag && (
                  <div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {plan.tag}
                    </span>
                  </div>
                )}

                {plan.features && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">{plan.features}</p>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(plan)}
                    className="flex-1 text-xs justify-center"
                  >
                    <Edit2 size={13} className="mr-1" /> Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50 justify-center"
                  >
                    <Trash2 size={13} className="mr-1" /> Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[650px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    {['Code', 'Name', 'Price', 'Tag', 'Features', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900 uppercase">{plan.code}</td>
                      <td className="px-4 py-3 font-semibold">{plan.name}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ${plan.price} {plan.currency} / {plan.billingPeriod}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{plan.tag || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{plan.features || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(plan)} className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                            <Edit2 size={14} className="inline mr-1" /> Edit
                          </button>
                          <button onClick={() => handleDelete(plan.id, plan.name)} className="text-xs text-red-600 font-semibold hover:underline cursor-pointer">
                            <Trash2 size={14} className="inline mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPlan ? 'Edit Pricing Plan' : 'Add Pricing Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. leader, org, pro"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="ex. Organisateur de groupe"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. Most popular"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Features (pipe-separated |)</label>
            <input
              type="text"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="w-full border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Unlimited communities|Create events|Analytics"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={createPlan.isPending || updatePlan.isPending}>
              {editingPlan ? 'Save Tariffs' : 'Create Tariff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function RefundsSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminRefundRequests();
  const reviewMutation = useReviewRefundRequest();

  const handleReview = (id: string, approve: boolean) => {
    reviewMutation.mutate(
      { id, approve },
      {
        onSuccess: () => toast.success(`Demande de remboursement ${approve ? 'approuvée' : 'rejetée'}.`),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Échec du traitement du remboursement.'),
      }
    );
  };

  const requests = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Demandes de remboursement</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">File d'attente des demandes de remboursement</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <CreditCard className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-700">Aucune demande de remboursement en attente.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="md:hidden space-y-3">
            {requests.map((req) => (
              <Card key={req.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{req.userName || 'Membre'}</p>
                    <p className="text-xs text-gray-400">{req.userEmail}</p>
                  </div>
                  <span className="font-extrabold text-base text-emerald-600">
                    ${req.amount ? req.amount.toFixed(2) : '10.00'} CAD
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl space-y-1 text-xs">
                  <p className="font-semibold text-gray-800">Motif : {req.reason}</p>
                  {req.details && <p className="text-gray-500 text-[11px] italic">« {req.details} »</p>}
                  <p className="text-[10px] text-gray-400 pt-1">
                    Déposée le {new Date(req.createdAt).toLocaleDateString('fr-CA')}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <StatusBadge status={req.status} />
                  {req.status === 'PENDING' ? (
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 text-xs py-1.5 flex-1 justify-center"
                        onClick={() => handleReview(req.id, false)}
                        disabled={reviewMutation.isPending}
                      >
                        Rejeter
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 font-bold flex-1 justify-center"
                        onClick={() => handleReview(req.id, true)}
                        disabled={reviewMutation.isPending}
                      >
                        Approuver
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Traité</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    {['User', 'Amount', 'Reason', 'Details', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{req.userName || 'Leader'}</p>
                        <p className="text-xs text-gray-400">{req.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">${req.amount ? req.amount.toFixed(2) : '10.00'}</td>
                      <td className="px-4 py-3 font-medium">{req.reason}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{req.details || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {req.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs py-1"
                              onClick={() => handleReview(req.id, true)}
                              disabled={reviewMutation.isPending}
                            >
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 text-xs py-1"
                              onClick={() => handleReview(req.id, false)}
                              disabled={reviewMutation.isPending}
                            >
                              Rejeter
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Traité</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ReportsSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminReports();
  const resolve = useResolveReport();

  const handleResolve = (id: string, action: 'REMOVE_CONTENT' | 'SUSPEND_USER' | 'DISMISS') => {
    resolve.mutate(
      { id, action },
      {
        onSuccess: () => toast.success('Signalement résolu avec succès.'),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible de résoudre ce signalement.'),
      }
    );
  };

  const reports = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">File des signalements</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Modération des contenus et des comportements</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <Flag className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-700">Aucun signalement en attente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString('fr-CA')}</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                      Objet : <span className="text-primary font-semibold">{report.targetLabel}</span> ({report.targetType})
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Motif : {report.reason}</p>
                    {report.details && <p className="text-xs text-gray-500 mt-1 italic">« {report.details} »</p>}
                    <p className="text-[11px] text-gray-400 mt-1">Signalé par : {report.reporterName}</p>
                  </div>
                  {report.status !== 'RESOLVED' && (
                    <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {report.targetType !== 'USER' && (
                        <Button size="sm" variant="danger" className="text-xs flex-1 sm:flex-none justify-center" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'REMOVE_CONTENT')}>
                          Supprimer le contenu
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs flex-1 sm:flex-none justify-center"
                        disabled={resolve.isPending}
                        onClick={() => handleResolve(report.id, 'SUSPEND_USER')}
                      >
                        Suspendre l'utilisateur
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs flex-1 sm:flex-none justify-center" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'DISMISS')}>
                        Classer sans suite
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionsSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminSubscriptions();
  const activeCount = (data ?? []).filter((s) => s.status === 'ACTIVE').length;
  const monthlyRevenue = (data ?? []).reduce(
    (sum, s) => sum + (s.status === 'ACTIVE' ? (s.plan === 'ORGANIZATION' ? 100 : s.plan === 'COMMUNITY_LEADER' ? 50 : 0) : 0),
    0
  );

  const subscriptions = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Abonnements &amp; Revenus</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Vue d'ensemble des abonnements actifs</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Abonnements actifs</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1E4D2B] mt-1">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Revenu estimé</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#E86225] mt-1">${monthlyRevenue} CAD</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <CreditCard className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-700">Aucun abonnement enregistré.</p>
        </div>
      ) : (
        <>
          {/* Mobile Subscription Cards (< md) */}
          <div className="md:hidden space-y-3">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{sub.userName}</p>
                    <p className="text-xs text-gray-400">{sub.userEmail}</p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl p-2.5">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Forfait</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {sub.plan.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Renouvellement</span>
                    <span className="font-medium text-gray-700">
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('fr-CA') : '—'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Depuis le</span>
                    <span className="text-gray-500 font-medium">
                      {new Date(sub.createdAt).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[650px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    {['User', 'Plan', 'Status', 'Renews', 'Since'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{sub.userName}</p>
                        <p className="text-xs text-gray-400">{sub.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{sub.plan.toLowerCase().replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LogsSection({ onBack }: { onBack?: () => void }) {
  const { data, isLoading } = useAdminLogs();

  const logs = data ?? [];

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#2C1810]">Journal d'activités</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Historique des actions administratives</p>
      </div>

      <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm font-semibold text-gray-700">Aucune activité enregistrée.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-[#E86225]/10 text-[#E86225] rounded-full flex items-center justify-center shrink-0">
                      <Shield size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{log.action}</p>
                      <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                        {log.description} · Par : {log.actorName}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 pl-11 sm:pl-0 shrink-0">
                    {new Date(log.createdAt).toLocaleString('fr-CA')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InteracSection({ onBack }: { onBack?: () => void }) {
  const { data: payments, isLoading } = useAdminInteracPayments();
  const confirmPayment = useConfirmInteracPayment();

  const handleConfirm = (p: InteracPayment) => {
    const isGroup = p.communityId || p.amount === 20 || (p.referenceNumber && p.referenceNumber.includes('JOIN'));
    const promptText = isGroup
      ? `Confirmer la réception du virement de 20 $ pour ${p.userName || 'ce membre'} ? Son adhésion au groupe « ${p.communityName || 'sélectionné'} » sera activée immédiatement.`
      : `Confirmer la réception du virement Interac pour ${p.userName || 'ce membre'} ? Son compte sera activé immédiatement.`;

    if (confirm(promptText)) {
      confirmPayment.mutate(p.id, {
        onSuccess: () => toast.success(`Paiement confirmé et adhésion/compte activé avec succès !`),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Erreur lors de la confirmation.'),
      });
    }
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:text-[#D0521B] py-1 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu général
        </button>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900">Virements Interac e-Transfer</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Vérifiez les paiements reçus par Virement Interac (Adhésions aux groupes 20 $, Inscriptions Leader 50 $, Inscriptions Organisation 100 $) et confirmez l'activation.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (payments ?? []).length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <Send className="mx-auto text-gray-300 mb-2" size={36} />
          <p className="text-sm font-bold text-gray-800">Aucun virement Interac enregistré.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Les demandes de virement s'afficheront ici en temps réel dès soumission par les membres.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on < md) */}
          <div className="md:hidden space-y-3">
            {(payments ?? []).map((p) => {
              const isGroup = p.communityId || p.amount === 20 || (p.referenceNumber && p.referenceNumber.includes('JOIN'));
              const isOrg = p.amount >= 100 || (p.referenceNumber && p.referenceNumber.includes('ORG'));
              return (
                <Card key={p.id} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {isGroup ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        🍽️ Adhésion Groupe
                      </span>
                    ) : isOrg ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                        🏢 Inscription Org (100 $)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        👑 Inscription Leader (50 $)
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(p.createdAt).toLocaleDateString('fr-CA')}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.userName || 'Membre'}</p>
                    <p className="text-xs text-gray-500">{p.userEmail || '—'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase font-bold">Groupe ciblé</span>
                      <span className="font-semibold text-gray-800">
                        {p.communityName || (isGroup ? 'Groupe d\'arrondissement' : 'Plateforme')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-[10px] block uppercase font-bold">Montant</span>
                      <span className="font-extrabold text-sm text-[#1E4D2B]">
                        ${p.amount} {p.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="min-w-0">
                      <span className="text-[10px] text-amber-800 font-bold block">N° de Référence Interac :</span>
                      <span className="font-mono font-bold text-xs text-amber-950 truncate block">
                        {p.referenceNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(p.referenceNumber);
                        toast.success('Référence copiée dans le presse-papier !');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                    >
                      <Copy size={12} /> Copier
                    </button>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <StatusBadge status={p.status} />
                    {p.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-3 flex-1 justify-center shadow-xs"
                        onClick={() => handleConfirm(p)}
                        disabled={confirmPayment.isPending}
                      >
                        <CheckCircle size={14} className="mr-1" /> Confirmer le paiement
                      </Button>
                    ) : (
                      <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        Validé ✓
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table View (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[720px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    {['Type', 'Membre', 'Groupe', 'N° Référence', 'Montant', 'Date', 'Statut', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(payments ?? []).map((p) => {
                    const isGroup = p.communityId || p.amount === 20 || (p.referenceNumber && p.referenceNumber.includes('JOIN'));
                    const isOrg = p.amount >= 100 || (p.referenceNumber && p.referenceNumber.includes('ORG'));
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          {isGroup ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                              🍽️ Adhésion Groupe
                            </span>
                          ) : isOrg ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
                              🏢 Inscription Org (100 $)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              👑 Inscription Leader (50 $)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{p.userName || 'Membre'}</p>
                            <p className="text-xs text-gray-400">{p.userEmail || '—'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {p.communityName || (isGroup ? 'Groupe' : 'Plateforme')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded border border-amber-200">
                            {p.referenceNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">${p.amount} {p.currency}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString('fr-CA')}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3">
                          {p.status === 'PENDING' ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm whitespace-nowrap"
                              onClick={() => handleConfirm(p)}
                              disabled={confirmPayment.isPending}
                            >
                              <CheckCircle size={14} className="mr-1" /> Confirmer le paiement
                            </Button>
                          ) : (
                            <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                              Validé ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
