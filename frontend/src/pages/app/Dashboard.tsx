import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CardSkeleton, Skeleton } from '../../components/ui/CardSkeleton';
import { useStore } from '../../store/useStore';
import { useMyCommunities } from '../../hooks/useCommunities';
import { useEvents } from '../../hooks/useEvents';
import { useActivityFeed } from '../../hooks/usePosts';
import { communityColor } from '../../lib/communityVisuals';
import { formatEventDate, formatEventTime, formatRelativeTime } from '../../lib/format';
import {
  Bell,
  Calendar,
  MapPin,
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  Compass,
  PlusCircle,
  Clock,
  Utensils
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';

export function Dashboard() {
  const { currentUser } = useStore();
  const userName = currentUser?.fullName || 'Membre';
  const role = currentUser?.role || 'MEMBER';

  const { data: myCommunities, isLoading: communitiesLoading } = useMyCommunities();
  const { data: eventsPage, isLoading: eventsLoading } = useEvents({ upcoming: true, size: 4 });
  const { data: feedPage, isLoading: feedLoading } = useActivityFeed(0, 6);

  const joinedCommunities = myCommunities ?? [];
  const upcomingEvents = eventsPage?.content ?? [];
  const activityFeed = feedPage?.content ?? [];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 md:px-12 py-6 md:py-8 max-w-[1600px] mx-auto space-y-8 w-full min-h-screen bg-[#FDFBF7] text-[#2C1810] font-body">
        
        {/* Command Center Hero Greeting Banner */}
        <section className="relative bg-[#133820] rounded-3xl overflow-hidden text-white p-6 sm:p-8 md:p-12 shadow-xl border border-[#1E4D2B]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E86225]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E4D2B]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-emerald-100 border border-white/10 uppercase tracking-wider">
                  <Sparkles size={14} className="text-[#E86225]" />
                  <span>Espace Membre</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-[#E86225] text-white px-3 py-1 rounded-full">
                  {role === 'COMMUNITY_LEADER' && <Shield size={13} />}
                  {role === 'ORGANIZATION' && <Building2 size={13} />}
                  <span>{role === 'COMMUNITY_LEADER' ? 'Organisateur' : role === 'ORGANIZATION' ? 'Organisation' : 'Membre'}</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                Bienvenue, {userName.split(' ')[0]} !
              </h1>
              <p className="text-emerald-100/90 text-base md:text-lg font-light leading-relaxed">
                Vous faites partie de <strong className="font-bold text-white">{joinedCommunities.length}</strong> groupe{joinedCommunities.length > 1 ? 's' : ''} et vous avez <strong className="font-bold text-white">{upcomingEvents.length}</strong> sortie{upcomingEvents.length > 1 ? 's' : ''} au restaurant à venir.
              </p>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/communities">
                <Button className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold px-5 py-6 rounded-xl shadow-md flex items-center gap-2 border border-white/20">
                  <Compass size={18} />
                  <span>Découvrir les groupes</span>
                </Button>
              </Link>
              {role === 'COMMUNITY_LEADER' && (
                <Link to="/leader-dashboard">
                  <Button className="bg-white text-[#133820] hover:bg-slate-100 font-bold px-5 py-6 rounded-xl shadow-md flex items-center gap-2">
                    <Shield size={18} />
                    <span>Portail Organisateur</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFE6DD] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center shrink-0">
              <Users size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#52433B]">Mes Groupes</p>
              <h3 className="text-3xl font-extrabold text-[#2C1810]">{joinedCommunities.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EFE6DD] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF0E9] text-[#E86225] flex items-center justify-center shrink-0">
              <Utensils size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#52433B]">Prochaines Sorties</p>
              <h3 className="text-3xl font-extrabold text-[#2C1810]">{upcomingEvents.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EFE6DD] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5EF] text-[#4A2C11] flex items-center justify-center shrink-0">
              <MessageSquare size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#52433B]">Messages Récents</p>
              <h3 className="text-3xl font-extrabold text-[#2C1810]">{activityFeed.length}</h3>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        {role === 'MEMBER' && (
          <div className="bg-[#E8F3EB] border border-[#1E4D2B]/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#1E4D2B] text-white flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#1E4D2B] text-base mb-1">Bienvenue sur Bouffe &amp; Amitié</h4>
              <p className="text-[#52433B] text-xs md:text-sm leading-relaxed">
                Rejoignez le groupe de sorties au restaurant de votre arrondissement, participez aux discussions et réservez votre place pour la prochaine rencontre !
              </p>
            </div>
          </div>
        )}

        {/* Main Dashboard Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Communities & Activity Feed) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* My Communities Horizontal Carousel */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE6DD] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-[#2C1810]">Mes Groupes par Arrondissement</h2>
                  <p className="text-xs text-[#52433B]">Groupes auxquels vous participez activement</p>
                </div>
                <Link to="/communities" className="text-xs font-bold text-[#E86225] hover:underline flex items-center gap-1">
                  <span>Voir tous les groupes</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {communitiesLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="w-64 h-36 rounded-2xl shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x">
                  {joinedCommunities.map((community) => (
                    <Link
                      to={`/communities/${community.id}`}
                      key={community.id}
                      className="snap-start shrink-0 w-64 group"
                    >
                      <Card className="h-full border border-[#EFE6DD] group-hover:border-[#E86225] shadow-xs hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-300",
                              communityColor(community.id, community.color)
                            )}
                          >
                            <span className="text-2xl font-black">{community.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-heading font-extrabold text-[#2C1810] text-base line-clamp-1 group-hover:text-[#E86225] transition-colors">
                            {community.name}
                          </h3>
                          <p className="text-xs font-semibold text-[#52433B] mt-1.5 flex items-center gap-1 bg-[#FAF5EF] px-3 py-1 rounded-full border border-[#EFE6DD]">
                            <Users size={13} className="text-[#E86225]" />
                            <span>{community.memberCount.toLocaleString()} membres</span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}

                  {/* Discover More Card */}
                  <div className="snap-start shrink-0 w-60">
                    <Link to="/communities" className="h-full block">
                      <Card className="h-full border-2 border-dashed border-[#E86225]/40 bg-[#FAF5EF]/50 hover:bg-[#FDF0E9] transition-all flex items-center justify-center min-h-[160px] rounded-3xl group">
                        <div className="text-center text-[#E86225]">
                          <div className="w-12 h-12 rounded-2xl bg-[#FDF0E9] flex items-center justify-center mx-auto mb-2 text-[#E86225] group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                          </div>
                          <span className="font-extrabold text-xs">Rejoindre un autre groupe</span>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Recent Activity Feed */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE6DD] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-[#2C1810]">Actualités &amp; Discussions</h2>
                  <p className="text-xs text-[#52433B]">Derniers messages publiés dans vos groupes</p>
                </div>
              </div>

              {feedLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : activityFeed.length > 0 ? (
                <div className="space-y-4">
                  {activityFeed.map((post) => (
                    <Link to={`/communities/${post.communityId}`} key={post.id} className="block group">
                      <Card className="hover:border-[#E86225]/40 hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl border border-[#EFE6DD]">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <img
                              src={post.authorAvatarUrl || `https://i.pravatar.cc/150?u=${post.authorId}`}
                              alt=""
                              className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="font-bold text-[#2C1810] text-sm">{post.authorName ?? 'Membre du club'}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="text-xs font-bold text-[#1E4D2B] bg-[#E8F3EB] px-2.5 py-0.5 rounded-md group-hover:bg-[#1E4D2B] group-hover:text-white transition-all">
                                  {post.communityName}
                                </span>
                              </div>
                              <p className="text-[#52433B] text-sm mb-4 leading-relaxed font-normal">
                                {post.body}
                              </p>
                              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock size={13} />
                                  <span>{formatRelativeTime(post.createdAt)}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E86225] group-hover:underline">
                                  <MessageSquare size={14} />
                                  <span>Rejoindre la discussion</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#FAF5EF] rounded-2xl border border-[#EFE6DD]">
                  <Users className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-[#52433B] text-xs max-w-md mx-auto">
                    Aucun message pour l'instant. Participez aux discussions de votre groupe pour démarrer l'échange !
                  </p>
                </div>
              )}
            </section>

          </div>

          {/* Right Column (Upcoming Events Sidebar) */}
          <div className="space-y-8">
            
            {/* Upcoming Events */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE6DD] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-heading font-extrabold text-[#2C1810]">Prochaines Sorties</h2>
                  <p className="text-xs text-[#52433B]">Vos rencontres au restaurant</p>
                </div>
                <Link to="/events" className="text-xs font-bold text-[#E86225] hover:underline flex items-center gap-1">
                  <span>Voir tout</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {eventsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link to={`/events/${event.id}`} key={event.id} className="block group">
                      <Card className="overflow-hidden hover:border-[#E86225] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#EFE6DD] rounded-3xl bg-white">
                        <div className="h-2.5 bg-gradient-to-r from-[#E86225] via-[#D0521B] to-[#1E4D2B] w-full" />
                        <CardContent className="p-5">
                          <h3 className="font-heading font-extrabold text-[#2C1810] text-base mb-2 group-hover:text-[#E86225] transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                          <div className="space-y-2 text-xs text-[#52433B] font-medium">
                            <div className="flex items-center gap-2 text-[#E86225] font-bold">
                              <Calendar size={14} className="shrink-0" />
                              <span>{formatEventDate(event.startAt)} &bull; {formatEventTime(event.startAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#52433B]">
                              <MapPin size={14} className="shrink-0 text-[#1E4D2B]" />
                              <span className="truncate">{event.online ? 'En ligne' : event.location}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#FAF5EF] rounded-2xl border border-[#EFE6DD]">
                  <Calendar className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-[#52433B] text-xs">Aucune sortie programmée pour le moment.</p>
                </div>
              )}
            </section>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}

export default Dashboard;
