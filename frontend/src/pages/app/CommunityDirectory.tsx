import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Clock, XCircle, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  useCommunityInvitations,
  useCommunitySearch,
  useJoinCommunity,
  useLeaveCommunity,
  useMyCommunities,
  useMyCreationRequests,
  useRespondToInvitation,
} from '../../hooks/useCommunities';
import { communityColor, communityIcon } from '../../lib/communityVisuals';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from '../../store/useToastStore';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useStore } from '../../store/useStore';
import { PageTransition } from '../../components/ui/PageTransition';

export function CommunityDirectory() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const isGuest = useStore((s) => s.status) !== 'authenticated';
  const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'invitations'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const discoverQuery = useCommunitySearch(searchQuery, selectedCategory === 'all' ? '' : selectedCategory, 0, 50);
  const myQuery = useMyCommunities(!isGuest);
  const myRequestsQuery = useMyCreationRequests(!isGuest);
  const invitationsQuery = useCommunityInvitations(!isGuest);

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const respondMutation = useRespondToInvitation();

  const rawCommunities = activeTab === 'discover' ? (discoverQuery.data?.content ?? []) : (myQuery.data ?? []);
  const loading = activeTab === 'discover' ? discoverQuery.isLoading : myQuery.isLoading;
  const invitations = invitationsQuery.data ?? [];

  const communities = rawCommunities.filter((c) => {
    if (selectedCategory === 'all') return true;
    return (c.category ?? '').toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleJoin = (id: string, name: string) => {
    if (isGuest) {
      navigate('/login', { state: { from: `/communities/${id}` } });
      return;
    }
    joinMutation.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.membershipState === 'JOINED' ? `🎉 Welcome to ${name}!` : `Request sent to join ${name}`);
      },
      onError: () => toast.info('Could not join this community. Please try again.'),
    });
  };

  const handleLeave = (id: string, name: string) => {
    leaveMutation.mutate(id, {
      onSuccess: () => toast.info(`You have left ${name}`),
      onError: (err) => toast.info(err.message || 'Could not leave this community.'),
    });
  };

  const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'Tech & Innovation', label: 'Tech & Innovation' },
    { id: 'Culture & Heritage', label: 'Culture & Heritage' },
    { id: 'Sports & Wellness', label: 'Sports & Wellness' },
    { id: 'Arts & Creative', label: 'Arts & Creative' },
    { id: 'Social & Networking', label: 'Social' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#102A43] w-full overflow-x-hidden">
        {/* Hero Banner */}
        <section className="bg-gradient-to-b from-[#07192C] via-[#0A2540] to-[#0F3054] text-white py-10 md:py-16 px-4 sm:px-6 md:px-12 mb-8 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 border border-white/10">
                <Sparkles size={14} className="text-[#38BDF8]" />
                <span>Community Discovery Hub</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                Explore & Join Communities
              </h1>
              <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed">
                Connect with like-minded individuals, join vibrant local groups, or launch a community of your own.
              </p>
            </div>

            {currentUser?.role === 'COMMUNITY_LEADER' && (
              <Link to="/create-community" className="shrink-0 w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold px-6 py-4 sm:py-6 rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <Plus size={20} />
                  <span>Create New Community</span>
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Main Content Container */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-12 space-y-6 sm:space-y-8">

          {/* Navigation Tabs - Fluid Touch Scrollable */}
          <div className="border-b border-[#E2E8F0] overflow-x-auto scrollbar-none max-w-full">
            <div className="flex space-x-1 sm:space-x-2 shrink-0 min-w-max pb-0.5">
              {[
                { id: 'discover', label: 'Discover Communities' },
                ...(isGuest
                  ? []
                  : [
                      { id: 'my', label: 'My Communities' },
                      { id: 'invitations', label: 'Invitations', badge: invitations.length },
                    ]),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "relative px-3.5 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                    activeTab === tab.id
                      ? "text-[#1D4ED8]"
                      : "text-[#486581] hover:text-[#102A43]"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge >= 0 ? (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  ) : null}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D4ED8] rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Category Filter Section */}
          {activeTab !== 'invitations' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search communities by name, topic, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all text-[#102A43]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
                  <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0",
                        selectedCategory === cat.id
                          ? "bg-[#1D4ED8] text-white shadow-sm"
                          : "bg-slate-100 text-[#486581] hover:bg-slate-200"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pending Requests Section (My Communities view) */}
          {activeTab === 'my' && (myRequestsQuery.data ?? []).filter((r) => r.status !== 'APPROVED').length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#486581] uppercase tracking-widest">Your Creation Requests</h3>
              {(myRequestsQuery.data ?? [])
                .filter((r) => r.status !== 'APPROVED')
                .map((req) => (
                  <Card key={req.id} className={req.status === 'REJECTED' ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30'}>
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#102A43] text-sm sm:text-base">{req.proposedName}</p>
                        <p className="text-xs text-[#486581] mt-0.5">Submitted {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      {req.status === 'REJECTED' ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full shrink-0">
                          <XCircle size={14} /> Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full shrink-0">
                          <Clock size={14} /> Pending admin approval
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Invitations View - Fully Mobile Responsive */}
          {activeTab === 'invitations' ? (
            invitationsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : invitations.length > 0 ? (
              <div className="space-y-4 max-w-3xl">
                {invitations.map((invite) => (
                  <Card key={invite.id} className="bg-gradient-to-b from-white to-[#F8FAFC] rounded-2xl shadow-sm border border-[#E2E8F0]">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md mb-2 inline-block border border-blue-100">
                          Pending Invitation
                        </span>
                        <p className="font-extrabold text-lg sm:text-xl text-[#102A43]">{invite.communityName}</p>
                        <p className="text-xs font-semibold text-[#486581] mt-1">Invited by {invite.invitedByName ?? 'a community leader'}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-initial rounded-xl font-bold border-slate-300 hover:bg-slate-100 text-xs py-2.5"
                          onClick={() => respondMutation.mutate({ id: invite.id, accept: false })}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-initial rounded-xl font-bold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs py-2.5 shadow-sm"
                          onClick={() => respondMutation.mutate({ id: invite.id, accept: true })}
                        >
                          Accept Invitation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-[#E2E8F0] max-w-2xl mx-auto px-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-slate-100 text-[#0A2540] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={28} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#102A43] mb-1">No pending invitations</h3>
                <p className="text-xs text-[#486581] max-w-md mx-auto">
                  When community leaders invite you to join their community, your invitations will appear here.
                </p>
              </div>
            )
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : communities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => {
                const Icon = communityIcon(community.iconName);
                const isJoined = community.membershipState === 'JOINED';
                const isPending = community.membershipState === 'PENDING_REQUEST';

                return (
                  <Card
                    key={community.id}
                    className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] hover:shadow-[0_25px_50px_-12px_rgba(29,78,216,0.20)] hover:border-[#1D4ED8]/50 hover:-translate-y-2 transition-all duration-300 ease-out"
                  >
                    {/* Header Graphic with Ambient Lighting */}
                    <div className="h-32 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] relative p-5 flex justify-between items-start overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                      <div className="absolute left-1/3 -bottom-10 w-28 h-28 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

                      <div className="relative z-10 translate-y-7">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-950/25 border-4 border-white group-hover:scale-105 transition-all duration-300',
                            communityColor(community.id, community.color)
                          )}
                        >
                          <Icon size={28} className="drop-shadow-sm" />
                        </div>
                      </div>

                      {community.category && (
                        <span className="relative z-10 text-[10px] font-black text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-white/25 shadow-sm group-hover:bg-white/30 transition-all">
                          {community.category}
                        </span>
                      )}
                    </div>

                    <CardContent className="pt-12 px-6 pb-6 flex-1 flex flex-col justify-between">
                      <Link to={`/communities/${community.id}`} className="block flex-1 group-hover:text-[#1D4ED8]">
                        <h3 className="text-xl font-heading font-extrabold text-[#0F172A] mb-2 group-hover:text-[#1D4ED8] transition-colors leading-tight line-clamp-1">
                          {community.name}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 mb-6 leading-relaxed font-normal">
                          {community.description || 'A welcoming community space on NewVillages.'}
                        </p>
                      </Link>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <Users size={14} className="text-[#1D4ED8]" />
                          <span>{community.memberCount.toLocaleString()} members</span>
                        </div>

                        {isJoined ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-xs">
                              <CheckCircle2 size={13} /> Joined
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-slate-400 hover:text-red-600 font-semibold p-1"
                              onClick={() => handleLeave(community.id, community.name)}
                              disabled={leaveMutation.isPending}
                            >
                              Leave
                            </Button>
                          </div>
                        ) : isPending ? (
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80">
                            <Clock size={14} /> Requested
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white font-bold rounded-xl px-5 py-2.5 text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02] active:scale-95 transition-all"
                            onClick={() => handleJoin(community.id, community.name)}
                            disabled={joinMutation.isPending}
                          >
                            <span>Join</span>
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E2E8F0] max-w-xl mx-auto px-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#102A43] mb-1">No communities found</h3>
              <p className="text-xs text-[#486581] mb-4">
                Try adjusting your search terms or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-[#1D4ED8] hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default CommunityDirectory;
