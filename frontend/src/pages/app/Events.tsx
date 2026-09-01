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
      <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2C1810] font-body">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#133820] via-[#164025] to-[#1E4D2B] text-white py-10 md:py-20 px-4 sm:px-6 md:px-12 mb-8 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-100 border border-white/15">
                <Sparkles size={14} className="text-[#E86225]" />
                <span>Espace sorties &amp; rencontres</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                Découvrez &amp; rejoignez des sorties
              </h1>
              <p className="text-emerald-100/90 text-base md:text-lg font-light leading-relaxed">
                Rencontrez des personnes près de chez vous et participez aux sorties au restaurant organisées par nos groupes.
              </p>
            </div>

            {canCreateEvent && (
              <div className="shrink-0">
                <Link to="/create-event">
                  <Button className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold px-6 py-6 rounded-xl shadow-lg flex items-center gap-2">
                    <Plus size={20} />
                    <span>Proposer une sortie</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 space-y-8">
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-[#EFE6DD]">
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'Toutes les sorties' },
                { id: 'upcoming', label: 'À venir' },
                ...(canCreateEvent ? [{ id: 'my', label: 'Mes sorties créées' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeTab(tab.id as typeof timeTab)}
                  className={cn(
                    'px-5 py-3.5 text-xs font-bold transition-all border-b-2 font-heading cursor-pointer',
                    timeTab === tab.id
                      ? 'border-[#E86225] text-[#E86225]'
                      : 'border-transparent text-[#52433B] hover:text-[#2C1810]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Event Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EFE6DD] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par titre de sortie, lieu ou groupe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FAF5EF] border border-[#EFE6DD] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E86225] focus:bg-white transition-all text-[#2C1810]"
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
                { id: 'all', label: 'Tous les formats' },
                { id: 'in-person', label: 'En personne' },
                { id: 'online', label: 'En ligne' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id as typeof filterType)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    filterType === type.id
                      ? "bg-[#1E4D2B] text-white shadow-sm"
                      : "bg-[#FAF5EF] text-[#52433B] hover:bg-[#EFE6DD]"
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
                    <Card className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-[#EFE6DD] shadow-[0_4px_25px_-5px_rgba(44,24,16,0.06)] hover:shadow-[0_25px_50px_-12px_rgba(232,98,37,0.20)] hover:border-[#E86225]/50 hover:-translate-y-2 transition-all duration-300 ease-out">
                      {/* Header Graphic with Ambient Lighting */}
                      <div className="h-32 bg-gradient-to-r from-[#133820] via-[#164025] to-[#1E4D2B] relative p-5 flex justify-between items-start overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#E86225]/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                        <span className="relative z-10 bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-white/25 shadow-sm">
                          {event.communityName ?? event.organizationName ?? 'Bouffe & Amitié'}
                        </span>

                        <div className="relative z-10 flex items-center gap-1.5">
                          {isMine && (
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/25">
                              <UserCheck size={11} /> Créé par vous
                            </span>
                          )}
                          {event.online ? (
                            <span className="flex items-center gap-1 bg-[#E86225] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                              <Video size={12} /> En ligne
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-white/25">
                              <MapPin size={12} /> En personne
                            </span>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col relative -mt-6 bg-white rounded-t-3xl justify-between">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-[#FAF5EF] rounded-2xl shadow-md border border-[#EFE6DD] flex items-center justify-center text-[#E86225] group-hover:scale-105 transition-transform duration-300">
                            <Calendar size={24} />
                          </div>

                          {isUpcoming ? (
                            <span className="text-[11px] font-extrabold text-[#1E4D2B] bg-[#E8F3EB] px-3 py-1 rounded-full border border-[#1E4D2B]/20 flex items-center gap-1 shadow-xs">
                              <Clock size={12} /> À venir
                            </span>
                          ) : (
                            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                              Sortie passée
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-extrabold text-[#2C1810] text-xl mb-3 leading-snug group-hover:text-[#E86225] transition-colors line-clamp-2">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mt-auto mb-6 text-xs sm:text-sm text-[#52433B] font-medium">
                          <div className="flex items-center gap-2 text-[#E86225] font-bold">
                            <Calendar size={15} className="shrink-0" />
                            <span>
                              {formatEventDate(event.startAt)} &bull; {formatEventTime(event.startAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            {event.online ? (
                              <Video size={15} className="text-[#1E4D2B] shrink-0" />
                            ) : (
                              <MapPin size={15} className="text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{event.online ? 'Lien de la rencontre fourni' : event.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#EFE6DD] mt-auto">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52433B] bg-[#FAF5EF] px-3 py-1.5 rounded-xl border border-[#EFE6DD]">
                            <Users size={14} className="text-[#1E4D2B]" />
                            <span>{event.goingCount} participant(s)</span>
                          </div>
                          <span className="inline-flex items-center gap-1 bg-[#FDF0E9] group-hover:bg-[#E86225] text-[#E86225] group-hover:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all duration-300 shadow-xs">
                            <span>Détails</span>
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
            <div className="text-center py-24 bg-white rounded-3xl border border-[#EFE6DD] max-w-xl mx-auto">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-[#2C1810] mb-2">Aucune sortie trouvée</h3>
              <p className="text-xs text-[#52433B] mb-4">
                Essayez une autre recherche ou modifiez vos filtres de sélection.
              </p>
              {canCreateEvent && (
                <Link to="/create-event">
                  <Button className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl text-xs px-5 py-2.5">
                    + Proposer une sortie dès maintenant
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
      <div className="min-h-screen bg-[#FDFBF7] px-6 py-12">
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
        toast.success(attending ? 'Vous avez annulé votre inscription.' : '🎉 Vous êtes inscrit(e) à cette sortie !'),
      onError: (err) => toast.info(err.message || 'Impossible de mettre à jour votre inscription.'),
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2C1810] font-body">
        {/* Detail Hero Banner */}
        <section className="bg-gradient-to-r from-[#133820] via-[#164025] to-[#1E4D2B] text-white py-12 px-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-emerald-100 hover:text-white font-semibold mb-8 transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Retour au calendrier des sorties
            </Link>
            <div className="inline-flex items-center bg-white/10 text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-white/15">
              {event.communityName ?? event.organizationName ?? 'Sortie Bouffe & Amitié'}
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold mb-6 leading-tight text-white">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-emerald-100">
              <span className="flex items-center gap-2">
                <Calendar size={18} className="text-[#E86225]" />
                {formatEventDate(event.startAt)} &bull; {formatEventTime(event.startAt)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-[#E86225]" />
                {event.online ? 'Rencontre en ligne' : event.location}
              </span>
              <span className="flex items-center gap-2">
                <Users size={18} className="text-[#E86225]" />
                {event.goingCount} participant(s)
              </span>
            </div>
          </div>
        </section>

        {/* Content & Action Box */}
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-white rounded-3xl border-[#EFE6DD] shadow-sm p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2C1810] mb-4">À propos de cette sortie</h2>
                <div className="prose text-[#52433B] leading-relaxed max-w-none space-y-4">
                  <p>{event.description || 'Aucun détail supplémentaire fourni par l\'organisateur.'}</p>

                  {event.online && event.onlineLink && (
                    <div className="bg-[#FAF5EF] p-4 rounded-2xl border border-[#EFE6DD] mt-6 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#2C1810]">Lien d'accès à la rencontre en ligne</h4>
                        <p className="text-xs text-[#52433B] truncate max-w-xs">{event.onlineLink}</p>
                      </div>
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#E86225] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#D0521B] transition-colors shrink-0"
                      >
                        <span>Rejoindre</span>
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
            <Card className="bg-white rounded-3xl border-[#EFE6DD] shadow-sm sticky top-24 p-6 space-y-5">
              <div>
                <h3 className="font-bold text-xl text-[#2C1810] mb-1">Inscription &amp; Réservation</h3>
                <p className="text-xs text-[#52433B]">Confirmez votre présence pour cette sortie communautaire.</p>
              </div>

              <Button
                className={cn(
                  "w-full py-6 rounded-2xl font-extrabold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer",
                  attending
                    ? "bg-[#1E4D2B] hover:bg-[#133820] text-white"
                    : "bg-[#E86225] hover:bg-[#D0521B] text-white"
                )}
                onClick={handleRsvpToggle}
                disabled={rsvpMutation.isPending}
              >
                {attending ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Inscrit(e) (Annuler ma réservation)</span>
                  </>
                ) : (
                  <span>S'inscrire à cette sortie</span>
                )}
              </Button>

              {attending && (
                <div className="bg-[#E8F3EB] text-[#1E4D2B] text-xs font-bold text-center py-3 px-4 rounded-xl border border-[#1E4D2B]/20">
                  🎉 Vous êtes inscrit(e) à cette sortie !
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
