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
        toast.success(res.membershipState === 'JOINED' ? `🎉 Bienvenue dans le groupe ${name} !` : `Demande envoyée pour rejoindre ${name}`);
      },
      onError: () => toast.info('Impossible de rejoindre ce groupe. Veuillez réessayer.'),
    });
  };

  const handleLeave = (id: string, name: string) => {
    leaveMutation.mutate(id, {
      onSuccess: () => toast.info(`Vous avez quitté le groupe ${name}`),
      onError: (err) => toast.info(err.message || 'Impossible de quitter ce groupe.'),
    });
  };

  const CATEGORIES = [
    { id: 'all', label: 'Tous les arrondissements' },
    { id: 'Plateau-Mont-Royal', label: 'Plateau-Mont-Royal' },
    { id: 'Ville-Marie', label: 'Ville-Marie / Centre-Ville' },
    { id: 'Rosemont', label: 'Rosemont–La Petite-Patrie' },
    { id: 'Villeray', label: 'Villeray–St-Michel' },
    { id: 'Sud-Ouest', label: 'Le Sud-Ouest / Griffintown' },
    { id: 'Québec & Régions', label: 'Québec & Régions' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2C1810] w-full overflow-x-hidden font-body">
        {/* Hero Banner */}
        <section className="bg-[#133820] text-white py-10 md:py-16 px-4 sm:px-6 md:px-12 mb-8 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-100 border border-white/10">
                <Sparkles size={14} className="text-[#E86225]" />
                <span>Groupes de sorties au restaurant</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                Groupes par arrondissement
              </h1>
              <p className="text-emerald-100/90 text-base md:text-lg font-light leading-relaxed">
                Rejoignez le groupe de votre quartier pour participer à 1 sortie au restaurant par mois et rencontrer de nouveaux amis.
              </p>
            </div>

            {currentUser?.role === 'COMMUNITY_LEADER' && (
              <Link to="/create-community" className="shrink-0 w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#E86225] hover:bg-[#D0521B] text-white font-bold px-6 py-4 sm:py-6 rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <Plus size={20} />
                  <span>Créer un nouveau groupe</span>
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Main Content Container */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-12 space-y-6 sm:space-y-8">

          {/* Navigation Tabs */}
          <div className="border-b border-[#EFE6DD] overflow-x-auto scrollbar-none max-w-full">
            <div className="flex space-x-1 sm:space-x-2 shrink-0 min-w-max pb-0.5">
              {[
                { id: 'discover', label: 'Découvrir les groupes' },
                ...(isGuest
                  ? []
                  : [
                      { id: 'my', label: 'Mes groupes' },
                      { id: 'invitations', label: 'Invitations', badge: invitations.length },
                    ]),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "relative px-3.5 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                    activeTab === tab.id
                      ? "text-[#E86225]"
                      : "text-[#52433B] hover:text-[#2C1810]"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge >= 0 ? (
                    <span className="bg-[#E86225] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  ) : null}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#E86225] rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Category Filter Section */}
          {activeTab !== 'invitations' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#EFE6DD] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom d'arrondissement ou quartier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#FAF5EF] border border-[#EFE6DD] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E86225] focus:bg-white transition-all text-[#2C1810]"
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
                          ? "bg-[#E86225] text-white shadow-sm"
                          : "bg-[#FAF5EF] text-[#52433B] hover:bg-[#E8F3EB]"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pending Requests Section */}
          {activeTab === 'my' && (myRequestsQuery.data ?? []).filter((r) => r.status !== 'APPROVED').length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#1E4D2B] uppercase tracking-widest">Vos demandes de création de groupe</h3>
              {(myRequestsQuery.data ?? [])
                .filter((r) => r.status !== 'APPROVED')
                .map((req) => (
                  <Card key={req.id} className={req.status === 'REJECTED' ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30'}>
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#2C1810] text-sm sm:text-base">{req.proposedName}</p>
                        <p className="text-xs text-[#52433B] mt-0.5">Soumise le {new Date(req.createdAt).toLocaleDateString('fr-CA')}</p>
                      </div>
                      {req.status === 'REJECTED' ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full shrink-0">
                          <XCircle size={14} /> Refusée
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full shrink-0">
                          <Clock size={14} /> En attente de validation
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Invitations View */}
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
                  <Card key={invite.id} className="bg-white rounded-2xl shadow-sm border border-[#EFE6DD]">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E86225] bg-[#FDF0E9] px-2.5 py-1 rounded-md mb-2 inline-block border border-[#E86225]/30">
                          Invitation en attente
                        </span>
                        <p className="font-extrabold text-lg sm:text-xl text-[#2C1810]">{invite.communityName}</p>
                        <p className="text-xs font-semibold text-[#52433B] mt-1">Invité(e) par {invite.invitedByName ?? 'un organisateur de groupe'}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-initial rounded-xl font-bold border-slate-300 hover:bg-slate-100 text-xs py-2.5"
                          onClick={() => respondMutation.mutate({ id: invite.id, accept: false })}
                        >
                          Décliner
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-initial rounded-xl font-bold bg-[#E86225] hover:bg-[#D0521B] text-white text-xs py-2.5 shadow-sm"
                          onClick={() => respondMutation.mutate({ id: invite.id, accept: true })}
                        >
                          Accepter l'invitation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-[#EFE6DD] max-w-2xl mx-auto px-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#FAF5EF] text-[#2C1810] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={28} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#2C1810] mb-1">Aucune invitation en attente</h3>
                <p className="text-xs text-[#52433B] max-w-md mx-auto">
                  Lorsque des organisateurs de groupe vous inviteront à rejoindre leur sortie, les invitations s'afficheront ici.
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
                    className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-[#EFE6DD] shadow-sm hover:shadow-xl hover:border-[#E86225]/50 hover:-translate-y-1.5 transition-all duration-300 ease-out"
                  >
                    {/* Header Graphic */}
                    <div className="h-32 bg-gradient-to-r from-[#133820] via-[#1E4D2B] to-[#164025] relative p-5 flex justify-between items-start overflow-hidden">
                      <div className="relative z-10 translate-y-7">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white group-hover:scale-105 transition-all duration-300',
                            communityColor(community.id, community.color)
                          )}
                        >
                          <Icon size={28} className="drop-shadow-sm" />
                        </div>
                      </div>

                      {community.category && (
                        <span className="relative z-10 text-[10px] font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider border border-white/25 shadow-sm">
                          {community.category}
                        </span>
                      )}
                    </div>

                    <CardContent className="pt-12 px-6 pb-6 flex-1 flex flex-col justify-between">
                      <Link to={`/communities/${community.id}`} className="block flex-1 group-hover:text-[#E86225]">
                        <h3 className="text-xl font-heading font-extrabold text-[#2C1810] mb-2 group-hover:text-[#E86225] transition-colors leading-tight line-clamp-1">
                          {community.name}
                        </h3>
                        <p className="text-[#52433B] text-xs sm:text-sm line-clamp-3 mb-6 leading-relaxed font-normal">
                          {community.description || 'Un groupe convivial de sorties au restaurant sur Bouffe & Amitié.'}
                        </p>
                      </Link>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#52433B] bg-[#FAF5EF] px-3 py-1.5 rounded-xl border border-[#EFE6DD]">
                          <Users size={14} className="text-[#E86225]" />
                          <span>{community.memberCount.toLocaleString()} membres</span>
                        </div>

                        {isJoined ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1E4D2B] bg-[#E8F3EB] px-3 py-1.5 rounded-xl border border-[#1E4D2B]/30">
                              <CheckCircle2 size={13} /> Membre
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-slate-400 hover:text-red-600 font-semibold p-1"
                              onClick={() => handleLeave(community.id, community.name)}
                              disabled={leaveMutation.isPending}
                            >
                              Quitter
                            </Button>
                          </div>
                        ) : isPending ? (
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                            <Clock size={14} /> Demandé
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl px-5 py-2.5 text-xs flex items-center gap-1.5 shadow-md group-hover:scale-[1.02] transition-all"
                            onClick={() => handleJoin(community.id, community.name)}
                            disabled={joinMutation.isPending}
                          >
                            <span>Rejoindre</span>
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
            <div className="text-center py-20 bg-white rounded-3xl border border-[#EFE6DD] max-w-xl mx-auto px-4">
              <div className="w-16 h-16 bg-[#FAF5EF] text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#2C1810] mb-1">Aucun groupe trouvé</h3>
              <p className="text-xs text-[#52433B] mb-4">
                Essayez d'ajuster vos termes de recherche ou de choisir un autre arrondissement.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-[#E86225] hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default CommunityDirectory;
