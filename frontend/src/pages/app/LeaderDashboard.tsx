import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { GlobalReportModal } from '../../components/ui/GlobalReportModal';
import { CommunityTermsModal } from '../../components/ui/CommunityTermsModal';
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  Check,
  Loader2,
  Trash2,
  Plus,
  Mail,
  FileText,
  DollarSign,
  MessageSquare,
  Flag,
  Send,
  Copy,
  Edit3,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  useApproveJoinRequest,
  useCommunityMembers,
  useLeaderAnalytics,
  useLeaderPendingRequests,
  useMyCommunities,
  useRejectJoinRequest,
  useInviteMember,
  useUpdateCommunityTerms,
} from '../../hooks/useCommunities';
import { useCreatePost } from '../../hooks/usePosts';
import { useEvents, useDeleteEvent } from '../../hooks/useEvents';
import {
  useLeaderRefundRequests,
  useSubmitRefundRequest,
} from '../../hooks/useAdmin';
import { useStartConversation } from '../../hooks/useMessaging';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';

export function LeaderDashboard() {
  const currentUser = useStore((s) => s.currentUser);
  const [activeSubTab, setActiveSubTab] = useState<
    'members' | 'requests' | 'composer' | 'events' | 'terms' | 'refunds' | 'analytics'
  >('members');

  const [announcementText, setAnnouncementText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Refund modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('10.00');
  const [refundDetails, setRefundDetails] = useState('');

  // Reporting state
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: myCommunities } = useMyCommunities();
  const ledCommunities = (myCommunities ?? []).filter((c) => c.leaderId === currentUser?.id);
  const [communityId, setCommunityId] = useState('');

  useEffect(() => {
    if (!communityId && ledCommunities.length > 0) {
      setCommunityId(ledCommunities[0].id);
    }
  }, [ledCommunities, communityId]);

  const selectedCommunity = ledCommunities.find((c) => c.id === communityId) || ledCommunities[0];

  // Custom terms state
  const [customTermsText, setCustomTermsText] = useState('');
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [isPreviewTermsOpen, setIsPreviewTermsOpen] = useState(false);

  useEffect(() => {
    if (selectedCommunity) {
      setCustomTermsText(selectedCommunity.customTerms || '');
      setIsEditingTerms(false);
    }
  }, [selectedCommunity]);

  const { data: members, isLoading: membersLoading } = useCommunityMembers(communityId || undefined);
  const { data: pendingRequests } = useLeaderPendingRequests(communityId || undefined);
  const { data: analytics } = useLeaderAnalytics(communityId || undefined);
  const { data: eventsQueryData, isLoading: eventsLoading } = useEvents({ communityId: communityId || undefined });
  const events = eventsQueryData?.content ?? [];

  const { data: refundRequests, isLoading: refundsLoading } = useLeaderRefundRequests();

  const approveRequest = useApproveJoinRequest(communityId);
  const rejectRequest = useRejectJoinRequest(communityId);
  const createPost = useCreatePost(communityId);
  const deleteEventMutation = useDeleteEvent();
  const inviteMemberMutation = useInviteMember(communityId);
  const updateTermsMutation = useUpdateCommunityTerms(communityId);
  const submitRefundMutation = useSubmitRefundRequest();
  const startConversation = useStartConversation();

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id, {
        onSuccess: () => toast.success('Event deleted successfully.'),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not delete event.'),
      });
    }
  };

  const handleAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !communityId) return;
    createPost.mutate(announcementText, {
      onSuccess: () => {
        toast.success('Announcement published to your community feed!');
        setAnnouncementText('');
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not publish announcement.'),
    });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail || !communityId) return;
    inviteMemberMutation.mutate(cleanEmail, {
      onSuccess: () => {
        toast.success(`Email invitation sent to ${cleanEmail}!`);
        setInviteEmail('');
        setIsInviteModalOpen(false);
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not send invitation email.'),
    });
  };

  const handleSaveTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId) return;
    updateTermsMutation.mutate(customTermsText, {
      onSuccess: () => {
        toast.success('Community Terms & Conditions updated successfully!');
        setIsEditingTerms(false);
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not update community terms.'),
    });
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;
    const numAmount = parseFloat(refundAmount) || 10.0;
    submitRefundMutation.mutate(
      { amount: numAmount, reason: refundReason, details: refundDetails },
      {
        onSuccess: () => {
          toast.success('Refund request submitted to platform admin!');
          setIsRefundModalOpen(false);
          setRefundReason('');
          setRefundDetails('');
        },
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Failed to submit refund request.'),
      }
    );
  };

  const handleMessageMember = (targetUserId: string, memberName: string | null) => {
    startConversation.mutate(
      {
        type: 'USER',
        targetUserId,
        initialMessage: `Hi ${memberName || 'there'}, reaching out from ${selectedCommunity?.name || 'our community'}!`,
      },
      {
        onSuccess: () => {
          toast.success(`Conversation started with ${memberName || 'member'}!`);
        },
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not start conversation.'),
      }
    );
  };

  if (ledCommunities.length === 0) {
    return (
      <div className="px-6 md:px-12 py-16 max-w-[1600px] mx-auto text-center">
        <Award size={40} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">No communities led yet</h1>
        <p className="text-gray-500">
          Once your community application is approved by the admin board, your circle manager will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-6 w-full font-body">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[#2C1810]">Espace Organisateur</h1>
          <p className="text-sm text-[#52433B]">Gérez votre groupe d'arrondissement, envoyez des invitations et organisez vos sorties.</p>
        </div>
        <div className="flex items-center gap-3">
          {ledCommunities.length > 1 && (
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="border border-[#EFE6DD] rounded-xl p-2.5 text-sm bg-white focus:ring-[#E86225] focus:outline-none"
            >
              {ledCommunities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 border-[#E86225] text-[#E86225] hover:bg-[#FDF0E9] font-bold"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/communities/${selectedCommunity?.id}`);
              toast.success('Lien d\'invitation copié dans le presse-papier !');
            }}
          >
            <Copy size={16} /> Copier le lien
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-1.5 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <Mail size={16} /> Inviter par courriel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-1 border-b border-[#EFE6DD]">
        {[
          { id: 'members', label: 'Liste des membres' },
          { id: 'requests', label: `Demandes d'adhésion (${pendingRequests?.length ?? 0})` },
          { id: 'composer', label: 'Publier une annonce' },
          { id: 'events', label: 'Sorties du groupe' },
          { id: 'terms', label: 'Règles du groupe' },
          { id: 'refunds', label: 'Demandes de remboursement' },
          { id: 'analytics', label: 'Statistiques' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'border-[#E86225] text-[#E86225] font-bold'
                : 'border-transparent text-[#52433B] hover:text-[#2C1810]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Roster tab */}
      {activeSubTab === 'members' && (
        <Card className="bg-white rounded-3xl border border-[#EFE6DD] shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#2C1810]">Liste des membres — {selectedCommunity?.name}</h3>
              <Button size="sm" variant="outline" onClick={() => setIsInviteModalOpen(true)} className="border-[#E86225] text-[#E86225] hover:bg-[#FDF0E9] font-bold rounded-xl">
                <Plus size={16} className="mr-1" /> Inviter un membre
              </Button>
            </div>
            {membersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#E86225]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#FAF5EF] text-xs uppercase text-[#52433B] font-extrabold border-b border-[#EFE6DD]">
                    <tr>
                      <th className="px-4 py-3">Membre</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Adhésion</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE6DD]">
                    {(members ?? []).map((member) => (
                      <tr key={member.userId} className="hover:bg-[#FAF5EF]/50">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`}
                            className="w-8 h-8 rounded-full border border-[#EFE6DD] object-cover"
                            alt=""
                          />
                          <div>
                            <p className="font-bold text-[#2C1810]">{member.fullName ?? 'Membre'}</p>
                            {(member.email || member.city) && (
                              <p className="text-xs text-[#52433B]">
                                {member.city ? `${member.city} ` : ''}
                                {member.email ? `(${member.email})` : ''}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#E86225]">
                          {member.roleInCommunity === 'LEADER' ? 'Organisateur' : 'Membre'}
                        </td>
                        <td className="px-4 py-3 text-[#52433B]">
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('fr-CA') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {member.userId !== currentUser?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Envoyer un message privé"
                                  onClick={() => handleMessageMember(member.userId, member.fullName)}
                                  className="text-[#E86225] hover:bg-[#FDF0E9]"
                                >
                                  <MessageSquare size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Signaler ce membre"
                                  onClick={() => setReportTarget({ id: member.userId, name: member.fullName || 'Membre' })}
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <Flag size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join Requests */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {(pendingRequests ?? []).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending join requests.</p>
          ) : (
            (pendingRequests ?? []).map((req) => (
              <Card key={req.userId}>
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.avatarUrl || `https://i.pravatar.cc/150?u=${req.userId}`}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-gray-900">{req.fullName ?? 'Membre'}</p>
                      <p className="text-xs text-gray-500">Requested {new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => rejectRequest.mutate(req.userId)}
                      disabled={rejectRequest.isPending}
                    >
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approveRequest.mutate(req.userId)} disabled={approveRequest.isPending}>
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Composer tab */}
      {activeSubTab === 'composer' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Publish Announcement</h3>
            <form onSubmit={handleAnnounce} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Community</label>
                <select
                  value={communityId}
                  onChange={(e) => setCommunityId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none"
                >
                  {ledCommunities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message content</label>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Share updates, news or event details directly to your community feed..."
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                {createPost.isSuccess && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check size={14} /> Announcement published!
                  </span>
                )}
                <span className="flex-1" />
                <Button type="submit" disabled={createPost.isPending}>
                  {createPost.isPending ? 'Publication…' : 'Annonce générale'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events tab */}
      {activeSubTab === 'events' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Community Events</h3>
              <Link to="/create-event" state={{ communityId: communityId }}>
                <Button size="sm" className="flex items-center gap-1.5">
                  <Plus size={16} /> Create Event
                </Button>
              </Link>
            </div>
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (events ?? []).length === 0 ? (
              <p className="text-center text-gray-500 py-8">No events published yet for this community.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Event Title</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Location / Link</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(events ?? []).map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{event.title}</td>
                        <td className="px-4 py-3 capitalize">{event.type.toLowerCase().replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {event.startAt ? new Date(event.startAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                          {event.online ? (
                            <a
                              href={event.onlineLink || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate block"
                            >
                              Online link
                            </a>
                          ) : (
                            event.location || '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deleteEventMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Group Terms & Conditions */}
      {activeSubTab === 'terms' && (
        <div className="space-y-6">
          {/* Active Terms Display Card (when terms exist and not editing) */}
          {selectedCommunity?.customTerms && !isEditingTerms ? (
            <Card className="border-emerald-100 shadow-xs">
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <FileText size={20} className="text-primary" /> Current Active Group Terms & Conditions
                      </h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active & Enforced
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      New members must review and accept these specific terms before joining <strong>{selectedCommunity?.name}</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewTermsOpen(true)}
                      className="text-xs gap-1.5 border-slate-200 hover:bg-slate-50"
                    >
                      <Eye size={14} /> Aperçu vue membre
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setCustomTermsText(selectedCommunity.customTerms || '');
                        setIsEditingTerms(true);
                      }}
                      className="text-xs gap-1.5"
                    >
                      <Edit3 size={14} /> Edit Terms
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove all custom terms for this community?')) {
                          updateTermsMutation.mutate('', {
                            onSuccess: () => {
                              toast.success('Custom terms removed.');
                              setCustomTermsText('');
                              setIsEditingTerms(false);
                            },
                          });
                        }
                      }}
                      className="text-xs text-red-600 hover:bg-red-50 gap-1.5"
                    >
                      <Trash2 size={14} /> Remove Terms
                    </Button>
                  </div>
                </div>

                {/* Formatted Terms View */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedCommunity.customTerms}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Members are required to check and agree to these terms prior to joining.</span>
                  <span className="font-medium text-slate-500">{selectedCommunity.customTerms.length} characters</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Terms Editor Card */
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                      <FileText size={20} className="text-primary" />
                      {selectedCommunity?.customTerms ? 'Edit Group Terms & Conditions' : 'Configure Group Custom Terms & Conditions'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Define community rules, guidelines, code of conduct, or participation agreements for <strong>{selectedCommunity?.name}</strong>.
                    </p>
                  </div>

                  {selectedCommunity?.customTerms && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomTermsText(selectedCommunity.customTerms || '');
                        setIsEditingTerms(false);
                      }}
                      className="text-xs text-slate-500 hover:bg-slate-100"
                    >
                      Cancel Editing
                    </Button>
                  )}
                </div>

                {/* Preset Guideline Templates */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Insert Preset Guidelines & Rules:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const preset = "1. Respect & Courtesy: All circle members must maintain mutual respect. Harassment, discrimination, or abusive language is strictly prohibited.\n2. Active Participation: Engage constructively in discussions and community events.\n3. Privacy & Safety: Do not share personal member details or private discussions outside the circle.";
                        setCustomTermsText(prev => prev ? `${prev}\n\n${preset}` : preset);
                      }}
                      className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={12} /> Add Respect & Safety Rules
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const preset = "• Attendance & RSVP Policy: Please RSVP for scheduled events in advance. If you cannot attend, notify the event host at least 24 hours prior.";
                        setCustomTermsText(prev => prev ? `${prev}\n\n${preset}` : preset);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={12} /> Add Event RSVP Policy
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const preset = "• No Unsolicited Spam or Advertising: Commercial promotions, external sales, or spam messages are not allowed unless approved by the Community Leader.";
                        setCustomTermsText(prev => prev ? `${prev}\n\n${preset}` : preset);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={12} /> Add Anti-Spam Policy
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveTerms} className="space-y-4">
                  <div>
                    <textarea
                      value={customTermsText}
                      onChange={(e) => setCustomTermsText(e.target.value)}
                      rows={9}
                      className="w-full border border-slate-300 rounded-xl p-4 text-xs font-sans focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none leading-relaxed"
                      placeholder="Enter specific community guidelines, rules of conduct, code of respect, or participation terms..."
                    />
                    <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                      <span>Tip: You can use numbered lists or bullet points to structure your guidelines clearly.</span>
                      <span>{customTermsText.length} characters</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {selectedCommunity?.customTerms && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCustomTermsText(selectedCommunity.customTerms || '');
                          setIsEditingTerms(false);
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updateTermsMutation.isPending}
                      className="text-xs font-semibold px-5"
                    >
                      {updateTermsMutation.isPending ? 'Saving & Publishing…' : 'Save & Publish Custom Terms'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Member Preview Modal */}
          {selectedCommunity && (
            <CommunityTermsModal
              isOpen={isPreviewTermsOpen}
              onClose={() => setIsPreviewTermsOpen(false)}
              onAccept={() => {
                toast.success('Preview agreement acknowledged!');
                setIsPreviewTermsOpen(false);
              }}
              communityName={selectedCommunity.name}
              customTerms={selectedCommunity.customTerms || customTermsText}
            />
          )}
        </div>
      )}

      {/* Refund Requests Tab */}
      {activeSubTab === 'refunds' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-600" /> Platform Fee & Subscription Refund Requests
                </h3>
                <p className="text-xs text-gray-500">
                  Request a refund for leader subscriptions or platform fees directly from platform administrators.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsRefundModalOpen(true)}>
                <Plus size={16} className="mr-1" /> Request Refund
              </Button>
            </div>

            {refundsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (refundRequests ?? []).length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No refund requests submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(refundRequests ?? []).map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">${req.amount ? req.amount.toFixed(2) : '10.00'}</td>
                        <td className="px-4 py-3 font-medium">{req.reason}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{req.details || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              req.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : req.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics tab */}
      {activeSubTab === 'analytics' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users size={32} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalMembers ?? '—'}</p>
              <p className="text-sm text-gray-500">Total des membres</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar size={32} className="mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.upcomingEvents ?? '—'}</p>
              <p className="text-sm text-gray-500">Upcoming Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp size={32} className="mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.pendingJoinRequests ?? '—'}</p>
              <p className="text-sm text-gray-500">Pending Join Requests</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Email Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Send Direct Email & Invitation Link">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <p className="text-xs text-gray-600">
            Invite a potential member to join <strong>{selectedCommunity?.name}</strong>. An email is dispatched and registered members receive an immediate in-app notification bell update.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Recipient Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="newmember@example.com"
              required
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-700 block">Shareable Direct Invitation Link</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/communities/${selectedCommunity?.id}`}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-[11px] text-gray-600 focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-xs py-2"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/communities/${selectedCommunity?.id}`);
                  toast.success('Invitation link copied to clipboard!');
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={inviteMemberMutation.isPending}>
              <Send size={14} className="mr-1.5" />
              {inviteMemberMutation.isPending ? 'Sending…' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Refund Modal */}
      <Modal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)} title="Request Subscription Refund">
        <form onSubmit={handleSubmitRefund} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Refund Amount ($ CAD)</label>
            <input
              type="number"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason for Refund</label>
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Duplicate charge, platform issue, community closing..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Additional Details (Optional)</label>
            <textarea
              value={refundDetails}
              onChange={(e) => setRefundDetails(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Provide invoice reference codes or further details..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={submitRefundMutation.isPending}>
              {submitRefundMutation.isPending ? 'Submitting…' : 'Submit Refund Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Report Modal for Member Roster */}
      {reportTarget && (
        <GlobalReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetName={reportTarget.name}
          targetType="USER"
          targetId={reportTarget.id}
        />
      )}
    </div>
  );
}
