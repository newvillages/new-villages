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
  { id: 'DINNER', label: 'Community Dinner' },
  { id: 'MEETING', label: 'Zoom / Online Meeting' },
  { id: 'WORKSHOP', label: 'Workshop' },
  { id: 'SOCIAL', label: 'Social Activity' },
  { id: 'SUPPORT_NETWORKING', label: 'Support & Networking' },
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
      setFormError('Please select a community you lead to host this event.');
      return;
    }

    if (!date || !time) {
      setFormError('Please choose a valid date and time.');
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
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not publish this event.'),
      }
    );
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 min-h-screen text-[#102A43]">
        <Link to="/events" className="inline-flex items-center gap-2 text-[#1D4ED8] font-semibold hover:underline text-sm">
          <ArrowLeft size={16} /> Back to Events Calendar
        </Link>

        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[#102A43]">Publish Community Event</h1>
          <p className="text-sm text-[#486581] mt-1">Organize dinners, meetups, webinars or local support workshops.</p>
        </div>

        {/* Warning if leader has no communities */}
        {!isOrgRole && ledCommunities.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-2 text-xs md:text-sm">
              <h4 className="font-bold text-amber-900">No Lead Community Found</h4>
              <p>
                To publish an event as a Community Leader, you need to create or lead at least one community.
              </p>
              <Link to="/create-community">
                <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl mt-2 flex items-center gap-1.5">
                  <Plus size={14} /> Create a Community First
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isOrgRole && !myOrganization && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="text-xs md:text-sm">
              <p className="font-bold">Organization Page Required</p>
              <p className="mt-1">
                You need to setup your organization page before publishing events.{' '}
                <Link to="/org/me" className="underline font-bold text-[#1D4ED8]">
                  Create Organization Page Now
                </Link>.
              </p>
            </div>
          </div>
        )}

        <Card className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleCreate} className="space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Event Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Community Tech Meetup & Coffee"
                  required
                  className="rounded-xl border-[#E2E8F0] py-3 text-[#102A43]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Event Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-[#E2E8F0] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#1D4ED8] focus:outline-none bg-white font-medium text-[#102A43]"
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
                    <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Target Host Community *</label>
                    <select
                      value={communityId}
                      onChange={(e) => setCommunityId(e.target.value)}
                      required
                      className="w-full border border-[#E2E8F0] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#1D4ED8] focus:outline-none bg-white font-medium text-[#102A43]"
                    >
                      <option value="" disabled>
                        Select a community you lead
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

              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-2.5 text-xs font-bold text-[#102A43] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={online}
                    onChange={(e) => setOnline(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1D4ED8] focus:ring-[#1D4ED8]"
                  />
                  <span>This is an online webinar / virtual event</span>
                </label>
              </div>

              {online ? (
                <div>
                  <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Online Link *</label>
                  <Input
                    value={onlineLink}
                    onChange={(e) => setOnlineLink(e.target.value)}
                    placeholder="https://zoom.us/j/123456789 or Google Meet URL"
                    required
                    className="rounded-xl border-[#E2E8F0] py-3 text-[#102A43]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Physical Location *</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 123 Yonge St, Suite 400, Toronto, ON"
                    required
                    className="rounded-xl border-[#E2E8F0] py-3 text-[#102A43]"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Date *</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="rounded-xl border-[#E2E8F0] py-3 text-[#102A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Time *</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="rounded-xl border-[#E2E8F0] py-3 text-[#102A43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">Event Details & Agenda *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] text-[#102A43]"
                  rows={4}
                  placeholder="Describe what attendees should expect, prepare, or bring to this event..."
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Link to="/events">
                  <Button type="button" variant="ghost" className="rounded-xl text-xs font-semibold">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-xl text-xs px-6 py-3 flex items-center gap-2 shadow-sm"
                  disabled={createEvent.isPending || (!isOrgRole && ledCommunities.length === 0)}
                >
                  {createEvent.isPending && <Loader2 size={16} className="animate-spin" />}
                  <span>Publish Event</span>
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
