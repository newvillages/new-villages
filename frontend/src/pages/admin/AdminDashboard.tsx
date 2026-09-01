import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BarChart2, Flag, CreditCard, FileText, Shield,
  UserX, CheckCircle, XCircle, Search, Loader2, Image as ImageIcon,
  Radio, Tag, DollarSign, Plus, Edit2, Trash2, Send
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
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
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

  const stats = useAdminStats();
  const reports = useAdminReports();
  const leaderApps = useAdminLeaderApplications();
  const refunds = useAdminRefundRequests();
  const interacPayments = useAdminInteracPayments();

  const pendingInteracCount = (interacPayments.data ?? []).filter((p) => p.status === 'PENDING').length;

  const sidebarLinks: { id: AdminSection; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Aperçu général', icon: BarChart2 },
    { id: 'interac', label: 'Virements Interac', icon: Send, badge: pendingInteracCount },
    { id: 'broadcast', label: 'Annonce générale (Broadcast)', icon: Radio },
    { id: 'users', label: 'Gestion des membres', icon: Users },
    { id: 'applications', label: 'Candidatures d\'organisateurs', icon: CheckCircle, badge: leaderApps.data?.length },
    { id: 'communities', label: 'Groupes d\'arrondissements', icon: Users },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'pricing', label: 'Tarifs & Formules', icon: DollarSign },
    { id: 'refunds', label: 'Demandes de remboursement', icon: CreditCard, badge: refunds.data?.filter((r) => r.status === 'PENDING').length },
    { id: 'reports', label: 'File des signalements', icon: Flag, badge: reports.data?.filter((r) => r.status === 'OPEN').length },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'logs', label: 'Journal d\'activités', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-[#E86225]" />
            <span className="font-heading font-bold text-sm">Administration</span>
          </div>
          <Link to="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors mt-1 block">
            ← Retour à l'application
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => setSection(link.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer',
                  section === link.id ? 'bg-[#E86225] text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                <span className="flex-1">{link.label}</span>
                {!!link.badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{link.badge}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#FDFBF7] font-body text-[#2C1810]">
        {section === 'overview' && <OverviewSection stats={stats.data} reports={reports.data ?? []} />}
        {section === 'interac' && <InteracSection />}
        {section === 'broadcast' && <BroadcastSection />}
        {section === 'users' && <UsersSection search={userSearch} setSearch={setUserSearch} />}
        {section === 'applications' && <ApplicationsSection />}
        {section === 'communities' && <CommunitiesSection />}
        {section === 'categories' && <CategoriesSection />}
        {section === 'pricing' && <PricingSection />}
        {section === 'refunds' && <RefundsSection />}
        {section === 'reports' && <ReportsSection />}
        {section === 'subscriptions' && <SubscriptionsSection />}
        {section === 'logs' && <LogsSection />}
      </div>
    </div>
  );
}

function OverviewSection({ stats, reports }: { stats: AdminStats | undefined; reports: ReportResponse[] | undefined }) {
  const reportsByStatus = [
    { status: 'Ouvert (OPEN)', rawStatus: 'OPEN' },
    { status: 'En révision (REVIEWING)', rawStatus: 'REVIEWING' },
    { status: 'Résolu (RESOLVED)', rawStatus: 'RESOLVED' },
  ].map((item) => ({
    status: item.status,
    count: (reports ?? []).filter((r) => r.status === item.rawStatus).length,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-extrabold text-[#2C1810]">Aperçu de la plateforme</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Membres inscrits" value={stats?.totalUsers ?? '—'} icon={Users} color="bg-[#E86225]" />
        <StatTile label="Groupes d'arrondissements" value={stats?.totalCommunities ?? '—'} icon={Users} color="bg-[#1E4D2B]" />
        <StatTile label="Abonnements actifs" value={stats?.activeSubscriptions ?? '—'} icon={CreditCard} color="bg-purple-600" />
        <StatTile label="Signalements ouverts" value={stats?.openReports ?? '—'} icon={Flag} color="bg-red-600" />
      </div>
      <Card className="bg-white rounded-3xl border border-[#EFE6DD] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2C1810]">Signalements par statut</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reportsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
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

function BroadcastSection() {
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
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Admin Broadcast Announcement</h1>
        <p className="text-sm text-gray-500">
          Send an official broadcast message / announcement to all active groups or target specific communities.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Broadcast Message Body *</label>
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

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">
                Will broadcast to <strong>{recipientCount}</strong> active {recipientCount === 1 ? 'community' : 'communities'}
              </span>
              <Button type="submit" className="bg-primary hover:bg-primary-hover flex items-center gap-2" disabled={broadcastMutation.isPending}>
                <Send size={16} />
                {broadcastMutation.isPending ? 'Sending Broadcast…' : `Send Broadcast to ${recipientCount} ${recipientCount === 1 ? 'Group' : 'Groups'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSection({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const { data, isLoading } = useAdminUsers(search);
  const suspend = useSuspendUser();
  const reinstate = useReinstateUser();
  const removeLeader = useRemoveLeaderRole();

  const handleRemoveLeader = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from Community Leader role? They will be demoted to regular MEMBER.`)) {
      removeLeader.mutate(userId, {
        onSuccess: () => toast.success(`Leader role removed for ${name}.`),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not remove leader role.'),
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">User & Leader Management</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="flex-1 text-sm focus:outline-none"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  {['User', 'Role', 'City', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.content ?? []).map((user) => (
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
                            className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                          >
                            <UserX size={14} className="inline mr-1" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => reinstate.mutate(user.id)}
                            disabled={reinstate.isPending}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            <CheckCircle size={14} className="inline mr-1" />
                            Reinstate
                          </button>
                        )}
                        {user.role === 'COMMUNITY_LEADER' && (
                          <button
                            onClick={() => handleRemoveLeader(user.id, user.fullName)}
                            disabled={removeLeader.isPending}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold"
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
        )}
      </div>
    </div>
  );
}

function ApplicationsSection() {
  const { data, isLoading } = useAdminLeaderApplications();
  const approve = useApproveLeaderApplication();
  const reject = useRejectLeaderApplication();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Leader Applications</h1>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (data ?? []).length === 0 ? (
        <p className="text-center text-gray-500 py-10">No pending leader applications.</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((app) => (
            <Card key={app.id}>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {app.coverImageUrl ? (
                    <img src={app.coverImageUrl} alt={app.proposedName} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{app.applicantName}</p>
                    <p className="text-sm text-primary font-medium">{app.proposedName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {app.city} • Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => reject.mutate(app.id)} disabled={reject.isPending}>
                    <XCircle size={14} className="mr-1" /> Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approve.mutate(app.id)} disabled={approve.isPending}>
                    <CheckCircle size={14} className="mr-1" /> Approve
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

function CommunitiesSection() {
  const { data, isLoading } = useAdminCommunities();
  const removeCommunity = useAdminRemoveCommunity();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Community Management</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  {['Community', 'Category', 'Members', 'Leader', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data ?? []).map((c) => (
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
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove Community
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriesSection() {
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
            toast.success('Category updated!');
            setModalOpen(false);
          },
        }
      );
    } else {
      createCat.mutate(
        { name, description },
        {
          onSuccess: () => {
            toast.success('Category created!');
            setModalOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      deleteCat.mutate(id, {
        onSuccess: () => toast.success(`Category "${catName}" deleted.`),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Community Categories</h1>
          <p className="text-sm text-gray-500">Manage categories available for communities.</p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {(data ?? []).map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-md">{cat.description || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(cat.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cat)} className="text-xs text-primary font-semibold hover:underline">
                          <Edit2 size={14} className="inline mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-600 font-semibold hover:underline">
                          <Trash2 size={14} className="inline mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

function PricingSection() {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Subscription Tariffs & Pricing Plans</h1>
          <p className="text-sm text-gray-500">Manage platform subscription pricing tiers and featured capabilities.</p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5">
          <Plus size={16} /> Add Pricing Plan
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {(data ?? []).map((plan) => (
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
                        <button onClick={() => openEdit(plan)} className="text-xs text-primary font-semibold hover:underline">
                          <Edit2 size={14} className="inline mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(plan.id, plan.name)} className="text-xs text-red-600 font-semibold hover:underline">
                          <Trash2 size={14} className="inline mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                placeholder="e.g. Community Leader"
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

function RefundsSection() {
  const { data, isLoading } = useAdminRefundRequests();
  const reviewMutation = useReviewRefundRequest();

  const handleReview = (id: string, approve: boolean) => {
    reviewMutation.mutate(
      { id, approve },
      {
        onSuccess: () => toast.success(`Refund request ${approve ? 'approved' : 'rejected'}.`),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Failed to process refund request.'),
      }
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Refund Requests Queue</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className="text-center text-gray-500 py-10">No refund requests submitted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {(data ?? []).map((req) => (
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
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 text-xs py-1"
                            onClick={() => handleReview(req.id, false)}
                            disabled={reviewMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsSection() {
  const { data, isLoading } = useAdminReports();
  const resolve = useResolveReport();

  const handleResolve = (id: string, action: 'REMOVE_CONTENT' | 'SUSPEND_USER' | 'DISMISS') => {
    resolve.mutate(
      { id, action },
      {
        onSuccess: () => toast.success('Report resolved.'),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not resolve this report.'),
      }
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Reports Queue</h1>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (data ?? []).length === 0 ? (
        <p className="text-center text-gray-500 py-10">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((report) => (
            <Card key={report.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      Subject: <span className="text-primary">{report.targetLabel}</span> ({report.targetType})
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Reason: {report.reason}</p>
                    {report.details && <p className="text-xs text-gray-500 mt-1">"{report.details}"</p>}
                    <p className="text-xs text-gray-400 mt-1">Reported by: {report.reporterName}</p>
                  </div>
                  {report.status !== 'RESOLVED' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {report.targetType !== 'USER' && (
                        <Button size="sm" variant="danger" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'REMOVE_CONTENT')}>
                          Remove Content
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-600"
                        disabled={resolve.isPending}
                        onClick={() => handleResolve(report.id, 'SUSPEND_USER')}
                      >
                        Suspend User
                      </Button>
                      <Button size="sm" variant="ghost" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'DISMISS')}>
                        Dismiss
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

function SubscriptionsSection() {
  const { data, isLoading } = useAdminSubscriptions();
  const activeCount = (data ?? []).filter((s) => s.status === 'ACTIVE').length;
  const monthlyRevenue = (data ?? []).reduce(
    (sum, s) => sum + (s.status === 'ACTIVE' ? (s.plan === 'ORGANIZATION' ? 20 : s.plan === 'COMMUNITY_LEADER' ? 10 : 0) : 0),
    0
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Subscriptions & Revenue</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">${monthlyRevenue}</p>
            <p className="text-sm text-gray-500">Est. Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-sm text-gray-500">Active Subs</p>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {(data ?? []).map((sub) => (
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
        )}
      </div>
    </div>
  );
}

function LogsSection() {
  const { data, isLoading } = useAdminLogs();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Activity Logs</h1>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(data ?? []).map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Shield size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500">
                      {log.description} · By: {log.actorName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InteracSection() {
  const { data: payments, isLoading } = useAdminInteracPayments();
  const confirmPayment = useConfirmInteracPayment();

  const handleConfirm = (id: string, name: string | null) => {
    if (confirm(`Confirmer la réception du virement Interac pour ${name || 'ce membre'} ? Le compte sera activé immédiatement.`)) {
      confirmPayment.mutate(id, {
        onSuccess: () => toast.success(`Paiement confirmé et compte activé avec succès !`),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Erreur lors de la confirmation.'),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Virements Interac e-Transfer</h1>
        <p className="text-sm text-gray-500">
          Vérifiez les paiements reçus par Virement Interac et confirmez l'activation des membres.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (payments ?? []).length === 0 ? (
          <div className="text-center py-12 px-4">
            <Send className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-700">Aucun virement Interac enregistré.</p>
            <p className="text-xs text-gray-400 mt-1">Les demandes de virement s'afficheront ici en temps réel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  {['Membre', 'Groupe', 'N° Référence', 'Montant', 'Date', 'Statut', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(payments ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{p.userName || 'Membre'}</p>
                        <p className="text-xs text-gray-400">{p.userEmail || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{p.communityName || 'Général'}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded border border-amber-200">
                        {p.referenceNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">${p.amount} {p.currency}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'PENDING' ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm"
                          onClick={() => handleConfirm(p.id, p.userName)}
                          disabled={confirmPayment.isPending}
                        >
                          <CheckCircle size={14} className="mr-1" /> Confirmer le paiement
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold">Activé ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
