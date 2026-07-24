import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Video,
  Search,
  ArrowRight,
  ArrowLeft,
  Plus,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Clock,
  UserCheck
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useEvent, useEvents, useRsvpToEvent } from '../../hooks/useEvents';
import { formatEventDate, formatEventTime } from '../../lib/format';
import { toast } from '../../store/useToastStore';
import { PageTransition } from '../../components/ui/PageTransition';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';

export function Events() {
  const currentUser = useStore((s) => s.currentUser);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'in-person'>('all');
  const [timeTab, setTimeTab] = useState<'all' | 'upcoming' | 'my'>('all');

  const { data, isLoading } = useEvents({ upcoming: false, size: 100 });

  const all = data?.content ?? [];
  const now = new Date();

  const filtered = all.filter((e) => {
    const eventDate = new Date(e.startAt);
    const isUpcoming = eventDate >= now;
    const isCreatedByMe = e.createdBy === currentUser?.id;

    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.communityName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.location ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === 'all' ||
      (filterType === 'online' && e.online) ||
      (filterType === 'in-person' && !e.online);

    const matchesTimeTab =
      timeTab === 'all' ||
      (timeTab === 'upcoming' && isUpcoming) ||
      (timeTab === 'my' && isCreatedByMe);

    return matchesSearch && matchesType && matchesTimeTab;
  });

  const canCreateEvent =
    currentUser?.role === 'COMMUNITY_LEADER' ||
    currentUser?.role === 'ORGANIZATION' ||
    currentUser?.role === 'ADMIN';

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#102A43]">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#07192C] via-[#0A2540] to-[#0F3054] text-white py-10 md:py-20 px-4 sm:px-6 md:px-12 mb-8 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 border border-white/10">
                <Sparkles size={14} className="text-[#38BDF8]" />
                <span>Community Events Hub</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                Discover & Join Events
              </h1>
              <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed">
                Connect locally, learn new skills, and participate in gatherings hosted by communities on NewVillages.
              </p>
            </div>

            {canCreateEvent && (
              <div className="shrink-0">
                <Link to="/create-event">
                  <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold px-6 py-6 rounded-xl shadow-lg flex items-center gap-2">
                    <Plus size={20} />
                    <span>Create New Event</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 space-y-8">
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0]">
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'upcoming', label: 'Upcoming' },
                ...(canCreateEvent ? [{ id: 'my', label: 'My Created Events' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeTab(tab.id as typeof timeTab)}
                  className={cn(
                    'px-5 py-3.5 text-xs font-bold transition-all border-b-2 font-heading',
                    timeTab === tab.id
                      ? 'border-[#1D4ED8] text-[#1D4ED8]'
                      : 'border-transparent text-[#486581] hover:text-[#102A43]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Event Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by event title, location, or host community..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all text-[#102A43]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Event Format Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block" />
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'in-person', label: 'In-Person' },
                { id: 'online', label: 'Online Webinars' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id as typeof filterType)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                    filterType === type.id
                      ? "bg-[#1D4ED8] text-white shadow-sm"
                      : "bg-slate-100 text-[#486581] hover:bg-slate-200"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => {
                const eventDate = new Date(event.startAt);
                const isUpcoming = eventDate >= now;
                const isMine = event.createdBy === currentUser?.id;

                return (
                  <Link to={`/events/${event.id}`} key={event.id} className="block group h-full">
                    <Card className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] hover:shadow-[0_25px_50px_-12px_rgba(29,78,216,0.20)] hover:border-[#1D4ED8]/50 hover:-translate-y-2 transition-all duration-300 ease-out">
                      {/* Header Graphic with Ambient Lighting */}
                      <div className="h-32 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] relative p-5 flex justify-between items-start overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        <div className="absolute left-1/3 -bottom-10 w-28 h-28 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

                        <span className="relative z-10 bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-white/25 shadow-sm">
                          {event.communityName ?? event.organizationName ?? 'New Villages'}
                        </span>

                        <div className="relative z-10 flex items-center gap-1.5">
                          {isMine && (
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/25">
                              <UserCheck size={11} /> Created by You
                            </span>
                          )}
                          {event.online ? (
                            <span className="flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                              <Video size={12} /> Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-white/25">
                              <MapPin size={12} /> In-Person
                            </span>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col relative -mt-6 bg-white rounded-t-3xl justify-between">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-2xl shadow-md border border-blue-100 flex items-center justify-center text-[#1D4ED8] group-hover:scale-105 transition-transform duration-300">
                            <Calendar size={24} />
                          </div>

                          {isUpcoming ? (
                            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1 shadow-xs">
                              <Clock size={12} /> Upcoming
                            </span>
                          ) : (
                            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                              Past Event
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-extrabold text-[#0F172A] text-xl mb-3 leading-snug group-hover:text-[#1D4ED8] transition-colors line-clamp-2">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mt-auto mb-6 text-xs sm:text-sm text-slate-600 font-medium">
                          <div className="flex items-center gap-2 text-[#1D4ED8] font-bold">
                            <Calendar size={15} className="shrink-0" />
                            <span>
                              {formatEventDate(event.startAt)} &bull; {formatEventTime(event.startAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            {event.online ? (
                              <Video size={15} className="text-emerald-600 shrink-0" />
                            ) : (
                              <MapPin size={15} className="text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{event.online ? 'Online Event Link Provided' : event.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <Users size={14} className="text-[#1D4ED8]" />
                            <span>{event.goingCount} attending</span>
                          </div>
                          <span className="inline-flex items-center gap-1 bg-[#1D4ED8]/10 group-hover:bg-[#1D4ED8] text-[#1D4ED8] group-hover:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all duration-300 shadow-xs">
                            <span>Event Details</span>
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-[#E2E8F0] max-w-xl mx-auto">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-[#102A43] mb-2">No events found</h3>
              <p className="text-xs text-[#486581] mb-4">
                Try a different search query or change your location / filter options.
              </p>
              {canCreateEvent && (
                <Link to="/create-event">
                  <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-xl text-xs px-5 py-2.5">
                    + Create Your Event Now
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);
  const rsvpMutation = useRsvpToEvent(id ?? '');

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const attending = event.myRsvpStatus === 'GOING';

  const handleRsvpToggle = () => {
    rsvpMutation.mutate(attending ? 'DECLINED' : 'GOING', {
      onSuccess: () =>
        toast.success(attending ? 'You have cancelled your RSVP.' : '🎉 You have registered for this event!'),
      onError: (err) => toast.info(err.message || 'Could not update your RSVP.'),
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#102A43]">
        {/* Detail Hero Banner */}
        <section className="bg-gradient-to-b from-[#07192C] to-[#0A2540] text-white py-12 px-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold mb-8 transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Back to Events Calendar
            </Link>
            <div className="inline-flex items-center bg-white/10 text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-white/10">
              {event.communityName ?? event.organizationName ?? 'New Villages Community Event'}
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold mb-6 leading-tight text-white">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <Calendar size={18} className="text-[#38BDF8]" />
                {formatEventDate(event.startAt)} &bull; {formatEventTime(event.startAt)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-[#38BDF8]" />
                {event.online ? 'Online Event' : event.location}
              </span>
              <span className="flex items-center gap-2">
                <Users size={18} className="text-[#38BDF8]" />
                {event.goingCount} attending
              </span>
            </div>
          </div>
        </section>

        {/* Content & Action Box */}
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-white rounded-3xl border-[#E2E8F0] shadow-sm p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#102A43] mb-4">About this Event</h2>
                <div className="prose text-[#486581] leading-relaxed max-w-none space-y-4">
                  <p>{event.description || 'No additional details provided by the event organizer.'}</p>

                  {event.online && event.onlineLink && (
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-blue-100 mt-6 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#102A43]">Online Event Access Link</h4>
                        <p className="text-xs text-[#486581] truncate max-w-xs">{event.onlineLink}</p>
                      </div>
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1E40AF] transition-colors shrink-0"
                      >
                        <span>Join Call</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* RSVP Sticky Card */}
          <div>
            <Card className="bg-white rounded-3xl border-[#E2E8F0] shadow-sm sticky top-24 p-6 space-y-5">
              <div>
                <h3 className="font-bold text-xl text-[#102A43] mb-1">Registration & RSVP</h3>
                <p className="text-xs text-[#486581]">Confirm your attendance for this community event.</p>
              </div>

              <Button
                className={cn(
                  "w-full py-6 rounded-2xl font-extrabold text-base transition-all shadow-md flex items-center justify-center gap-2",
                  attending
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
                )}
                onClick={handleRsvpToggle}
                disabled={rsvpMutation.isPending}
              >
                {attending ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Attending (Cancel RSVP)</span>
                  </>
                ) : (
                  <span>Attend This Event</span>
                )}
              </Button>

              {attending && (
                <div className="bg-green-50 text-green-700 text-xs font-bold text-center py-3 px-4 rounded-xl border border-green-200">
                  🎉 You are registered for this event!
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Events;
