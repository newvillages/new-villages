import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useMyCommunities } from '../../hooks/useCommunities';
import { useMyOrganization } from '../../hooks/useOrganizations';
import { useCreateEvent } from '../../hooks/useEvents';
import { ApiError } from '../../lib/apiClient';
import { PageTransition } from '../../components/ui/PageTransition';

const EVENT_TYPES = [
  { id: 'DINNER', label: 'Repas au restaurant' },
  { id: 'MEETING', label: 'Rencontre virtuelle / Zoom' },
  { id: 'WORKSHOP', label: 'Atelier / Échange' },
  { id: 'SOCIAL', label: 'Activité sociale' },
  { id: 'SUPPORT_NETWORKING', label: 'Réseautage & Entraide' },
];

export function CreateEvent() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const currentUser = useStore((s) => s.currentUser);
  const { data: myCommunities } = useMyCommunities();
  const { data: myOrganization } = useMyOrganization();
  const createEvent = useCreateEvent();

  const ledCommunities = (myCommunities ?? []).filter((c) => c.leaderId === currentUser?.id || currentUser?.role === 'ADMIN');
  const isOrgRole = currentUser?.role === 'ORGANIZATION';

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const stateCommunityId = (routerLocation.state as { communityId?: string })?.communityId || '';

  const [communityId, setCommunityId] = useState(stateCommunityId);
  const [type, setType] = useState('SOCIAL');
  const [title, setTitle] = useState('');
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [date, setDate] = useState(tomorrowStr);
  const [time, setTime] = useState('18:00');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId && ledCommunities.length > 0) {
      setCommunityId(ledCommunities[0].id);
    }
  }, [ledCommunities, communityId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isOrgRole && !communityId) {
      setFormError('Veuillez sélectionner le groupe que vous organisez.');
      return;
    }

    if (!date || !time) {
      setFormError('Veuillez choisir une date et une heure valides.');
      return;
    }

    const startAt = new Date(`${date}T${time}`).toISOString();

    createEvent.mutate(
      {
        communityId: isOrgRole ? undefined : communityId || undefined,
        organizationId: isOrgRole ? myOrganization?.id : undefined,
        title,
        description,
        type,
        startAt,
        online,
        location: online ? undefined : location,
        onlineLink: online ? onlineLink : undefined,
      },
      {
        onSuccess: () => navigate('/events'),
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Impossible de publier cette sortie.'),
      }
    );
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 min-h-screen text-[#2C1810] font-body bg-[#FDFBF7]">
        <Link to="/events" className="inline-flex items-center gap-2 text-[#E86225] font-semibold hover:underline text-sm">
          <ArrowLeft size={16} /> Retour au calendrier des sorties
        </Link>

        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[#2C1810]">Proposer une sortie</h1>
          <p className="text-sm text-[#52433B] mt-1">Organisez un repas au restaurant, des rencontres conviviales ou des activités de groupe.</p>
        </div>

        {/* Warning if leader has no communities */}
        {!isOrgRole && ledCommunities.length === 0 && (
          <div className="bg-[#FAF5EF] border border-[#EFE6DD] text-[#2C1810] p-5 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-[#E86225] shrink-0 mt-0.5" size={20} />
            <div className="space-y-2 text-xs md:text-sm">
              <h4 className="font-bold text-[#2C1810]">Aucun groupe organisé trouvé</h4>
              <p>
                Pour proposer une sortie en tant qu'organisateur, vous devez d'abord administrer un groupe.
              </p>
              <Link to="/create-community">
                <Button size="sm" className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl mt-2 flex items-center gap-1.5">
                  <Plus size={14} /> Créer un groupe d'abord
                </Button>
              </Link>
            </div>
          </div>
        )}

        <Card className="bg-white rounded-3xl border border-[#EFE6DD] shadow-sm">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleCreate} className="space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Titre de la sortie *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Souper convivial chez Le Petit Resto"
                  required
                  className="rounded-xl border-[#EFE6DD] py-3 text-[#2C1810] bg-[#FAF5EF]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Type d'activité *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-[#EFE6DD] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#E86225] focus:outline-none bg-[#FAF5EF] font-medium text-[#2C1810]"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!isOrgRole && (
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Groupe hôte *</label>
                    <select
                      value={communityId}
                      onChange={(e) => setCommunityId(e.target.value)}
                      required
                      className="w-full border border-[#EFE6DD] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#E86225] focus:outline-none bg-[#FAF5EF] font-medium text-[#2C1810]"
                    >
                      <option value="" disabled>
                        Sélectionnez votre groupe
                      </option>
                      {ledCommunities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-[#FAF5EF] p-4 rounded-2xl border border-[#EFE6DD]">
                <label className="flex items-center gap-2.5 text-xs font-bold text-[#2C1810] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={online}
                    onChange={(e) => setOnline(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E86225] focus:ring-[#E86225]"
                  />
                  <span>Rencontre en ligne (visioconférence)</span>
                </label>
              </div>

              {online ? (
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Lien de la rencontre *</label>
                  <Input
                    value={onlineLink}
                    onChange={(e) => setOnlineLink(e.target.value)}
                    placeholder="https://zoom.us/j/123456789 ou lien Google Meet"
                    required
                    className="rounded-xl border-[#EFE6DD] py-3 text-[#2C1810] bg-[#FAF5EF]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Adresse / Restaurant *</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex : Restaurant Le Petit Resto, 1234 Rue Principale, Montréal"
                    required
                    className="rounded-xl border-[#EFE6DD] py-3 text-[#2C1810] bg-[#FAF5EF]"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Date *</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="rounded-xl border-[#EFE6DD] py-3 text-[#2C1810] bg-[#FAF5EF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Heure *</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="rounded-xl border-[#EFE6DD] py-3 text-[#2C1810] bg-[#FAF5EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Détails &amp; Présentation *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#EFE6DD] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225] text-[#2C1810] bg-[#FAF5EF]"
                  rows={4}
                  placeholder="Décrivez le déroulement de la sortie, les informations pratiques ou le menu..."
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EFE6DD]">
                <Link to="/events">
                  <Button type="button" variant="ghost" className="rounded-xl text-xs font-semibold">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl text-xs px-6 py-3 flex items-center gap-2 shadow-sm"
                  disabled={createEvent.isPending || (!isOrgRole && ledCommunities.length === 0)}
                >
                  {createEvent.isPending && <Loader2 size={16} className="animate-spin" />}
                  <span>Publier la sortie</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default CreateEvent;
