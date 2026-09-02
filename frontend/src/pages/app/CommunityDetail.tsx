import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowLeft, Flag, UserPlus, UserMinus, ShieldAlert, Clock, MessageSquare, Share2, Mail, Copy } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useCommunity, useCommunityMembers, useJoinCommunity, useLeaveCommunity, useInviteMember } from '../../hooks/useCommunities';
import { useEvents } from '../../hooks/useEvents';
import { useCommunityPosts, useCreatePost } from '../../hooks/usePosts';
import { communityColor } from '../../lib/communityVisuals';
import { formatEventDate, formatEventTime, formatRelativeTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { GlobalReportModal } from '../../components/ui/GlobalReportModal';
import { CommunityTermsModal } from '../../components/ui/CommunityTermsModal';
import { useStartConversation } from '../../hooks/useMessaging';
import { useStore } from '../../store/useStore';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';

type Tab = 'feed' | 'members' | 'events' | 'about';

export function CommunityDetail() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLeaderOpen, setReportLeaderOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [postDraft, setPostDraft] = useState('');

  const { data: community, isLoading: communityLoading } = useCommunity(id);
  const { data: members, isLoading: membersLoading } = useCommunityMembers(id);
  const { data: eventsPage } = useEvents({ communityId: id });
  const { data: postsPage, isLoading: postsLoading } = useCommunityPosts(id);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const inviteMutation = useInviteMember(id ?? '');
  const createPost = useCreatePost(id ?? '');
  const startConversation = useStartConversation();

  const communityEvents = eventsPage?.content ?? [];
  const posts = postsPage?.content ?? [];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'feed', label: 'Actualités & Discussions' },
    { id: 'members', label: 'Membres' },
    { id: 'events', label: `Sorties (${communityEvents.length})` },
    { id: 'about', label: 'À propos' },
  ];

  if (communityLoading || !community) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const joined = community.membershipState === 'JOINED';
  const pending = community.membershipState === 'PENDING_REQUEST';
  const isLeader = community.leaderId === currentUser?.id || currentUser?.role === 'COMMUNITY_LEADER';

  const handleJoinClick = () => {
    if (joined) {
      leaveMutation.mutate(community.id, {
        onError: (err) => toast.info(err.message || 'Impossible de quitter ce groupe.'),
      });
    } else if (!pending) {
      if (community.customTerms && community.customTerms.trim().length > 0) {
        setTermsModalOpen(true);
      } else {
        executeJoin();
      }
    }
  };

  const executeJoin = () => {
    joinMutation.mutate(community.id, {
      onSuccess: () => {
        toast.success('Demande envoyée / groupe rejoint avec succès !');
        setTermsModalOpen(false);
      },
      onError: (err) => toast.info(err.message || 'Impossible de rejoindre ce groupe.'),
    });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !id) return;
    inviteMutation.mutate(inviteEmail, {
      onSuccess: () => {
        toast.success(`Invitation envoyée à ${inviteEmail} !`);
        setInviteEmail('');
        setInviteModalOpen(false);
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : "Impossible d'envoyer le courriel d'invitation."),
    });
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDraft.trim()) return;
    createPost.mutate(postDraft, {
      onSuccess: () => setPostDraft(''),
      onError: (err) => toast.info(err.message || 'Impossible de publier votre message.'),
    });
  };

  const handleContactLeader = () => {
    startConversation.mutate(
      {
        type: 'LEADER',
        communityId: community.id,
        initialMessage: `Bonjour ${community.leaderName ?? "l'organisateur"}, j'ai une question concernant le groupe ${community.name}.`,
      },
      {
        onSuccess: () => navigate('/messages'),
        onError: (err) => toast.info(err.message || "Impossible de démarrer la conversation avec l'organisateur."),
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium">
        <ArrowLeft size={16} /> Retour aux groupes
      </Link>

      {/* Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg mb-8 bg-white border border-gray-100">
        <div className={`h-44 sm:h-56 bg-gradient-to-r ${communityColor(community.id, community.color)} p-6 flex flex-col justify-end relative`}>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase tracking-wider">
            {community.visibility}
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900">{community.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Users size={16} /> {community.memberCount} membres</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> Organisé par <strong className="text-gray-800">{community.leaderName ?? 'Organisateur de groupe'}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {isLeader && (
              <Button
                variant="outline"
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5 font-semibold"
              >
                <Mail size={16} /> Inviter un membre
              </Button>
            )}

            {!isLeader && (
              pending ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                  <Clock size={16} /> Demande envoyée
                </span>
              ) : (
                <Button
                  variant={joined ? "outline" : "primary"}
                  onClick={handleJoinClick}
                  disabled={joinMutation.isPending || leaveMutation.isPending}
                >
                  {joined ? <><UserMinus size={16} className="mr-2"/> Quitter le groupe</> : <><UserPlus size={16} className="mr-2"/> Rejoindre le groupe</>}
                </Button>
              )
            )}
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Lien du groupe copié dans le presse-papier !');
              }}
              className="flex items-center gap-1.5"
            >
              <Share2 size={16} /> Partager le lien
            </Button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Signaler ce groupe"
            >
              <Flag size={20} />
            </button>
          </div>
        </div>

        {community.customTerms && (
          <div className="mx-6 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-blue-600" />
              <span>Ce groupe applique des règles particulières pour ses membres.</span>
            </div>
            <button onClick={() => setTermsModalOpen(true)} className="text-primary font-bold hover:underline">
              Consulter les règles
            </button>
          </div>
        )}

        <div className="flex space-x-1 border-b border-gray-200 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("relative px-4 py-3 text-sm font-medium transition-colors", activeTab === tab.id ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-700')}
            >
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="communityTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {joined && (
            <Card>
              <CardContent className="p-5">
                <form onSubmit={handlePost}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">+</div>
                    <textarea
                      value={postDraft}
                      onChange={(e) => setPostDraft(e.target.value)}
                      className="flex-1 resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                      placeholder="Partagez un message ou une annonce avec le groupe..."
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button type="submit" size="sm" disabled={!postDraft.trim() || createPost.isPending}>Publier</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {postsLoading ? (
            <CardSkeleton />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <Card key={post.id}>
                <CardContent className="p-5 flex gap-3">
                  <img src={post.authorAvatarUrl || `https://i.pravatar.cc/150?u=${post.authorId}`} alt="" className="w-10 h-10 rounded-full shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{post.authorName ?? 'Membre'}</span>
                      <span className="text-gray-400 text-xs">{formatRelativeTime(post.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{post.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="p-5"><p className="text-gray-500 text-center py-4">Aucun message pour l'instant. Soyez le premier à participer !</p></CardContent></Card>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        membersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(members ?? []).map(member => (
              <Card key={member.userId}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`} alt="" className="w-12 h-12 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{member.fullName ?? 'Membre'}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {member.roleInCommunity === 'LEADER' ? 'Organisateur' : 'Membre'} {member.city ? `• ${member.city}` : ''}
                      </p>
                      {member.email && <p className="text-[11px] text-gray-400 truncate">{member.email}</p>}
                    </div>
                  </div>
                  {member.userId !== currentUser?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs flex items-center gap-1"
                      onClick={() => navigate('/messages', { state: { targetUserId: member.userId, targetUserName: member.fullName } })}
                    >
                      <MessageSquare size={14} /> Message privé
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          {communityEvents.length > 0 ? (
            communityEvents.map(evt => (
              <Card key={evt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                      {evt.type === 'DINNER' ? 'Repas au restaurant' : evt.type === 'SOCIAL' ? 'Activité sociale' : evt.type}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">{evt.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{evt.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {formatEventDate(evt.startAt)}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {formatEventTime(evt.startAt)}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {evt.online ? 'En ligne' : evt.location}</span>
                    </div>
                  </div>
                  <Link to={`/events/${evt.id}`}>
                    <Button variant="outline" size="sm">Voir la sortie</Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="p-8 text-center text-gray-500">Aucune sortie programmée pour ce groupe pour le moment.</CardContent></Card>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">À propos du groupe</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{community.description || 'Aucune présentation pour le moment.'}</p>
                </div>
                {community.category && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Catégorie</h3>
                    <span className="text-primary bg-primary/10 px-3 py-1 rounded-full text-xs font-semibold">
                      {community.category}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {community.customTerms && (
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-600" /> Règles particulières du groupe
                  </h3>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {community.customTerms}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="p-5 space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <ShieldAlert size={16} className="text-primary" /> Organisateur du groupe
                </h4>
                <div className="flex items-center gap-3 pt-2">
                  <img src="https://i.pravatar.cc/40?u=leader" className="w-10 h-10 rounded-full" alt="Organisateur" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{community.leaderName ?? 'Organisateur de groupe'}</p>
                    <p className="text-xs text-gray-500">Organisateur de groupe</p>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1" onClick={handleContactLeader}>
                    <MessageSquare size={14} /> Contacter l'organisateur
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-red-600 hover:bg-red-50 flex items-center justify-center gap-1" onClick={() => setReportLeaderOpen(true)}>
                    <Flag size={14} /> Signaler l'organisateur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Report Community Modal */}
      <GlobalReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="COMMUNITY"
        targetId={community.id}
        targetName={community.name}
      />

      {/* Report Leader Modal */}
      <GlobalReportModal
        isOpen={reportLeaderOpen}
        onClose={() => setReportLeaderOpen(false)}
        targetType="USER"
        targetId={community.leaderId}
        targetName={community.leaderName ?? 'Organisateur de groupe'}
      />

      {/* Community Terms Modal */}
      <CommunityTermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        communityName={community.name}
        customTerms={community.customTerms ?? ''}
        onAccept={executeJoin}
      />

      {/* Send Email Invite Modal */}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title={`Inviter un membre à ${community.name}`}>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <p className="text-xs text-slate-500">
            Envoyez une invitation par courriel à un membre potentiel. S'il possède déjà un compte sur Bouffe &amp; Amitié, il recevra également une notification instantanée.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse courriel de l'invité</label>
            <Input
              type="email"
              required
              placeholder="Ex : ami@exemple.ca"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
            <span className="text-slate-600 font-medium truncate mr-2">{window.location.href}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Lien d'invitation copié !");
              }}
              className="shrink-0 text-xs h-7 gap-1"
            >
              <Copy size={12} /> Copier
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setInviteModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Envoi…' : "Envoyer l'invitation"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
