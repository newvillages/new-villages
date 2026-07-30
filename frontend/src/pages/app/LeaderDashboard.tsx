import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { GlobalReportModal } from '../../components/ui/GlobalReportModal';
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

  useEffect(() => {
    if (selectedCommunity) {
      setCustomTermsText(selectedCommunity.customTerms || '');
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
    if (!inviteEmail.trim() || !communityId) return;
    inviteMemberMutation.mutate(inviteEmail, {
      onSuccess: () => {
        toast.success(`Email invitation sent to ${inviteEmail}!`);
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
      onSuccess: () => toast.success('Community Terms & Conditions updated successfully!'),
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
    <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-6 w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Leader Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your community circles, send invitations, set terms & request refunds.</p>
        </div>
        <div className="flex items-center gap-3">
          {ledCommunities.length > 1 && (
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:outline-none"
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
            className="flex items-center gap-1.5 bg-[#2D2159] hover:bg-[#3F2A78]"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <Mail size={16} /> Send Email Invite
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-1 border-b border-gray-200">
        {[
          { id: 'members', label: 'Member Roster' },
          { id: 'requests', label: `Join Requests (${pendingRequests?.length ?? 0})` },
          { id: 'composer', label: 'Broadcast Message' },
          { id: 'events', label: 'Manage Events' },
          { id: 'terms', label: 'Group Terms & Conditions' },
          { id: 'refunds', label: 'Refund Requests' },
          { id: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Roster tab */}
      {activeSubTab === 'members' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Active Roster — {selectedCommunity?.name}</h3>
              <Button size="sm" variant="outline" onClick={() => setIsInviteModalOpen(true)}>
                <Plus size={16} className="mr-1" /> Invite Member
              </Button>
            </div>
            {membersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(members ?? []).map((member) => (
                      <tr key={member.userId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`}
                            className="w-8 h-8 rounded-full"
                            alt=""
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{member.fullName ?? 'Member'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize">{member.roleInCommunity.toLowerCase()}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {member.userId !== currentUser?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Direct Message Member"
                                  onClick={() => handleMessageMember(member.userId, member.fullName)}
                                >
                                  <MessageSquare size={16} className="text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Report Member to Admin"
                                  onClick={() => setReportTarget({ id: member.userId, name: member.fullName || 'Member' })}
                                >
                                  <Flag size={16} className="text-red-500" />
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
                      <p className="font-bold text-gray-900">{req.fullName ?? 'Member'}</p>
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
                  {createPost.isPending ? 'Publishing…' : 'Broadcast Message'}
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
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-primary" /> Group Custom Terms & Conditions
              </h3>
              <p className="text-xs text-gray-500">
                Define community rules and specific terms that new members must accept before joining{' '}
                <strong>{selectedCommunity?.name}</strong>.
              </p>
            </div>
            <form onSubmit={handleSaveTerms} className="space-y-4">
              <textarea
                value={customTermsText}
                onChange={(e) => setCustomTermsText(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Enter specific community guidelines, rules of conduct, code of respect, or participation terms..."
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={updateTermsMutation.isPending}>
                  {updateTermsMutation.isPending ? 'Saving…' : 'Save Custom Terms'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
              <p className="text-sm text-gray-500">Total Members</p>
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
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Send Direct Email Invitation">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <p className="text-xs text-gray-600">
            Send an official email invitation to a potential member to join <strong>{selectedCommunity?.name}</strong>.
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
