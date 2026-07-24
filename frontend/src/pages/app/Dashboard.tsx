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
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';

export function Dashboard() {
  const { currentUser } = useStore();
  const userName = currentUser?.fullName || 'Member';
  const role = currentUser?.role || 'MEMBER';

  const { data: myCommunities, isLoading: communitiesLoading } = useMyCommunities();
  const { data: eventsPage, isLoading: eventsLoading } = useEvents({ upcoming: true, size: 4 });
  const { data: feedPage, isLoading: feedLoading } = useActivityFeed(0, 6);

  const joinedCommunities = myCommunities ?? [];
  const upcomingEvents = eventsPage?.content ?? [];
  const activityFeed = feedPage?.content ?? [];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 md:px-12 py-6 md:py-8 max-w-[1600px] mx-auto space-y-8 w-full min-h-screen bg-[#F8FAFC] text-[#102A43]">
        
        {/* Command Center Hero Greeting Banner */}
        <section className="relative bg-gradient-to-r from-[#07192C] via-[#0A2540] to-[#1D4ED8] rounded-3xl overflow-hidden text-white p-6 sm:p-8 md:p-12 shadow-xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-slate-200 border border-white/10 uppercase tracking-wider">
                  <Sparkles size={14} className="text-[#38BDF8]" />
                  <span>Command Center</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-[#1D4ED8] text-white px-3 py-1 rounded-full">
                  {role === 'COMMUNITY_LEADER' && <Shield size={13} />}
                  {role === 'ORGANIZATION' && <Building2 size={13} />}
                  <span>{role.replace('_', ' ')}</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                Welcome back, {userName.split(' ')[0]}!
              </h1>
              <p className="text-slate-200 text-base md:text-lg font-light leading-relaxed">
                You belong to <strong className="font-bold text-white">{joinedCommunities.length}</strong> communit{joinedCommunities.length === 1 ? 'y' : 'ies'} with <strong className="font-bold text-white">{upcomingEvents.length}</strong> upcoming event{upcomingEvents.length === 1 ? '' : 's'} on your schedule.
              </p>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/communities">
                <Button className="bg-white text-[#0A2540] hover:bg-slate-100 font-bold px-5 py-6 rounded-xl shadow-md flex items-center gap-2 border border-white/20">
                  <Compass size={18} />
                  <span>Discover Communities</span>
                </Button>
              </Link>
              {role === 'COMMUNITY_LEADER' && (
                <Link to="/leader-dashboard">
                  <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold px-5 py-6 rounded-xl shadow-md flex items-center gap-2">
                    <Shield size={18} />
                    <span>Leader Portal</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
              <Users size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#486581]">My Communities</p>
              <h3 className="text-3xl font-extrabold text-[#102A43]">{joinedCommunities.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0A2540] flex items-center justify-center shrink-0">
              <Calendar size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#486581]">Upcoming Events</p>
              <h3 className="text-3xl font-extrabold text-[#102A43]">{upcomingEvents.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#102A43] flex items-center justify-center shrink-0">
              <MessageSquare size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#486581]">Recent Posts</p>
              <h3 className="text-3xl font-extrabold text-[#102A43]">{activityFeed.length}</h3>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        {role === 'MEMBER' && (
          <div className="bg-blue-50/60 border border-blue-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-white flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#102A43] text-base mb-1">Welcome to New Villages</h4>
              <p className="text-[#486581] text-xs md:text-sm leading-relaxed">
                Connect with local groups near you, participate in community discussions, or send direct messages to community leaders.
              </p>
            </div>
          </div>
        )}

        {/* Main Dashboard Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Communities & Activity Feed) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* My Communities Horizontal Carousel */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-[#102A43]">My Communities</h2>
                  <p className="text-xs text-[#486581]">Groups you are currently an active member of</p>
                </div>
                <Link to="/communities" className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1">
                  <span>View Directory</span>
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
                      <Card className="h-full border border-slate-200/80 group-hover:border-[#1D4ED8]/50 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 group-hover:-translate-y-1 transition-all duration-300 rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-900/15 border-2 border-white group-hover:scale-105 transition-transform duration-300",
                              communityColor(community.id, community.color)
                            )}
                          >
                            <span className="text-2xl font-black">{community.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-heading font-extrabold text-[#0F172A] text-base line-clamp-1 group-hover:text-[#1D4ED8] transition-colors">
                            {community.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            <Users size={13} className="text-[#1D4ED8]" />
                            <span>{community.memberCount.toLocaleString()} members</span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}

                  {/* Discover More Card */}
                  <div className="snap-start shrink-0 w-60">
                    <Link to="/communities" className="h-full block">
                      <Card className="h-full border-2 border-dashed border-blue-200/80 bg-slate-50/50 shadow-none hover:bg-blue-50/60 hover:border-[#1D4ED8]/50 transition-all flex items-center justify-center min-h-[160px] rounded-3xl group">
                        <div className="text-center text-[#1D4ED8]">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-2 text-[#1D4ED8] group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                          </div>
                          <span className="font-extrabold text-xs">Discover More</span>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Recent Activity Feed */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-[#102A43]">Recent Activity</h2>
                  <p className="text-xs text-[#486581]">Latest updates and posts across your communities</p>
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
                      <Card className="hover:border-[#1D4ED8]/30 hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl border border-[#E2E8F0]">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <img
                              src={post.authorAvatarUrl || `https://i.pravatar.cc/150?u=${post.authorId}`}
                              alt=""
                              className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="font-bold text-[#102A43] text-sm">{post.authorName ?? 'Community Member'}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-0.5 rounded-md group-hover:bg-[#1D4ED8] group-hover:text-white transition-all">
                                  {post.communityName}
                                </span>
                              </div>
                              <p className="text-[#486581] text-sm mb-4 leading-relaxed font-normal">
                                {post.body}
                              </p>
                              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock size={13} />
                                  <span>{formatRelativeTime(post.createdAt)}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] group-hover:underline">
                                  <MessageSquare size={14} />
                                  <span>Join Discussion</span>
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
                <div className="text-center py-12 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                  <Users className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-[#486581] text-xs max-w-md mx-auto">
                    No activity posts yet. Join more communities or write a post to start the conversation!
                  </p>
                </div>
              )}
            </section>

          </div>

          {/* Right Column (Upcoming Events Sidebar) */}
          <div className="space-y-8">
            
            {/* Upcoming Events */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-heading font-extrabold text-[#102A43]">Upcoming Events</h2>
                  <p className="text-xs text-[#486581]">Upcoming gatherings & webinars</p>
                </div>
                <Link to="/events" className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1">
                  <span>Full Calendar</span>
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
                      <Card className="overflow-hidden hover:border-[#1D4ED8]/50 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 rounded-3xl bg-white">
                        <div className="h-2.5 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] w-full" />
                        <CardContent className="p-5">
                          <h3 className="font-heading font-extrabold text-[#0F172A] text-base mb-2 group-hover:text-[#1D4ED8] transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                          <div className="space-y-2 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-2 text-[#1D4ED8] font-bold">
                              <Calendar size={14} className="shrink-0" />
                              <span>{formatEventDate(event.startAt)} &bull; {formatEventTime(event.startAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <MapPin size={14} className="shrink-0 text-slate-400" />
                              <span className="truncate">{event.online ? 'Online Event' : event.location}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                  <Calendar className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-[#486581] text-xs">No upcoming events scheduled right now.</p>
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
