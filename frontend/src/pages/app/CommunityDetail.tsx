import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowLeft, Flag, UserPlus, UserMinus, ShieldAlert, Clock, MessageSquare, Share2, Mail, Copy } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useCommunity, useCommunityMembers, useJoinCommunity, useLeaveCommunity, useInviteMember, useCommunityInvitations, useRespondToInvitation } from '../../hooks/useCommunities';
import { useEvents } from '../../hooks/useEvents';
import { useCommunityPosts, useCreatePost } from '../../hooks/usePosts';
import { communityColor } from '../../lib/communityVisuals';
import { formatEventDate, formatEventTime, formatRelativeTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { GlobalReportModal } from '../../components/ui/GlobalReportModal';
import { CommunityTermsModal } from '../../components/ui/CommunityTermsModal';
import { PaymentModal } from '../../components/subscription/PaymentModal';
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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
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
  const { data: invitations } = useCommunityInvitations(!!currentUser);
  const respondInviteMutation = useRespondToInvitation();
  const createPost = useCreatePost(id ?? '');
  const startConversation = useStartConversation();

  const myInvite = invitations?.find((inv) => inv.communityId === id && inv.status === 'PENDING');

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
  const isLeader = community.leaderId === currentUser?.id;
  const isAdmin = currentUser?.role === 'ADMIN';
  const hasAccess = joined || isLeader || isAdmin;

  const handleJoinClick = () => {
    if (joined) {
      leaveMutation.mutate(community.id, {
        onError: (err) => toast.info(err.message || 'Impossible de quitter ce groupe.'),
      });
    } else if (!pending) {
      setPaymentModalOpen(true);
    }
  };

  const executeJoin = () => {
    if (myInvite) {
      respondInviteMutation.mutate({ id: myInvite.id, accept: true });
    }
    joinMutation.mutate(community.id, {
      onSettled: () => {
        setPaymentModalOpen(false);
        setTermsModalOpen(false);
        toast.success(`Demande d'adhésion et virement de 20 $ CAD soumis pour ${community.name} ! L'administration activera votre accès dès confirmation du virement Interac.`);
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

      {/* Pending Invitation Alert Banner */}
      {myInvite && !joined && !pending && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FFF8F3] border-2 border-[#E86225] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E86225] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Mail size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E86225] bg-white px-2 py-0.5 rounded border border-[#E86225]/30 inline-block mb-1">
                Invitation reçue de {myInvite.invitedByName ?? 'un organisateur'}
              </span>
              <h3 className="font-extrabold text-[#2C1810] text-sm sm:text-base">
                Vous êtes invité(e) à rejoindre « {community.name} » !
              </h3>
              <p className="text-xs text-[#52433B] mt-0.5 leading-relaxed">
                Pour valider votre invitation et participer aux sorties, vous devez régler votre contribution unique de 20 $ CAD par Virement Interac.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold border-slate-300 flex-1 sm:flex-initial"
              onClick={() => respondInviteMutation.mutate({ id: myInvite.id, accept: false })}
            >
              Décliner
            </Button>
            <Button
              size="sm"
              className="text-xs font-bold bg-[#E86225] hover:bg-[#D0521B] text-white flex-1 sm:flex-initial shadow-sm"
              onClick={() => setPaymentModalOpen(true)}
            >
              Payer &amp; Rejoindre (20 $ CAD)
            </Button>
          </div>
        </div>
      )}

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
                <button 
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Voir les instructions de virement Interac"
                >
                  <Clock size={15} className="animate-spin text-amber-700" /> 
                  <span>Adhésion en attente de validation admin (20 $ CAD)</span>
                </button>
              ) : (
                <Button
                  variant={joined ? "outline" : "primary"}
                  onClick={handleJoinClick}
                  disabled={joinMutation.isPending || leaveMutation.isPending}
                >
                  {joined ? <><UserMinus size={16} className="mr-2"/> Quitter le groupe</> : <><UserPlus size={16} className="mr-2"/> Rejoindre le groupe (20 $ CAD)</>}
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

        {hasAccess && (
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
        )}
      </div>

      {hasAccess ? (
        <>
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
                    <CardContent className="p-4 flex items-center gap-3">
                      <img src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`} alt="" className="w-10 h-10 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">{member.fullName ?? 'Membre'}</p>
                        <p className="text-xs text-gray-500">{member.roleInCommunity === 'LEADER' ? '👑 Organisateur' : 'Membre'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {communityEvents.length > 0 ? (
                communityEvents.map(event => (
                  <Card key={event.id}>
                    <CardContent className="p-5 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-primary">{event.type}</span>
                        <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{formatEventDate(event.startAt)} à {formatEventTime(event.startAt)}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {event.online ? 'En ligne' : event.location}</span>
                        </div>
                      </div>
                      <Link to={`/events/${event.id}`}>
                        <Button size="sm" variant="outline">Détails de la sortie</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card><CardContent className="p-5 text-center text-gray-500 py-8">Aucune sortie prévue pour le moment dans ce groupe.</CardContent></Card>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Description du groupe</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{community.description}</p>
                  </CardContent>
                </Card>

                {community.customTerms && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                        <ShieldAlert size={16} className="text-primary" /> Règlement intérieur du groupe
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
        </>
      ) : pending ? (
        <Card className="rounded-3xl border-[#EFE6DD] shadow-sm bg-white overflow-hidden p-6 sm:p-10 text-center max-w-2xl mx-auto my-8 space-y-5">
          <div className="w-16 h-16 bg-amber-50 text-[#E86225] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Clock size={32} className="animate-spin text-[#E86225]" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2">
              Validation administrative en cours
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1810]">
              Adhésion à « {community.name} » en attente de confirmation
            </h2>
            <p className="text-xs sm:text-sm text-[#52433B] mt-2 max-w-lg mx-auto leading-relaxed">
              Votre demande d'adhésion pour rejoindre <strong>{community.name}</strong> a bien été enregistrée.
              L'accès complet au groupe (actualités, discussions et sorties au restaurant) sera débloqué dès que l'administration aura confirmé la réception de votre virement Interac de 20 $ CAD.
            </p>
          </div>

          <div className="bg-[#FAF5EF] rounded-2xl border border-[#EFE6DD] p-4 text-xs text-left max-w-md mx-auto space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Destinataire (Auto-Dépôt) :</span>
              <span className="font-mono font-bold text-[#133820]">bouffe@newvillages.ca</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Montant d'adhésion :</span>
              <span className="font-extrabold text-[#E86225]">20,00 $ CAD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Statut :</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[11px]">
                En attente de vérification bancaire
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setPaymentModalOpen(true)}
            className="font-bold text-xs border-[#E86225] text-[#E86225] hover:bg-[#FDF0E9]"
          >
            Revoir les coordonnées de virement Interac
          </Button>
        </Card>
      ) : (
        <div className="max-w-2xl mx-auto my-6 space-y-6">
          <div className="bg-[#FAF5EF] border border-[#EFE6DD] rounded-2xl p-5 sm:p-6 text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E86225] bg-white px-3 py-1 rounded-full border border-[#E86225]/30 inline-block">
              🔒 Portail d'adhésion obligatoire
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1810]">
              Rejoindre le groupe « {community.name} »
            </h2>
            <p className="text-xs sm:text-sm text-[#52433B] leading-relaxed max-w-lg mx-auto">
              Pour accéder à ce groupe, voir les actualités et participer aux sorties conviviales au restaurant, chaque nouveau membre doit s'acquitter de la contribution unique de 20 $ CAD par Virement Interac.
            </p>
          </div>

          <PaymentModal
            plan={{
              id: 'group_join',
              label: `Adhésion à ${community.name}`,
              price: '20 $',
              period: 'Paiement unique',
              features: [
                'Accès complet aux annonces du groupe',
                'Participation aux sorties conviviales au restaurant',
                'Échanges avec tous les membres du groupe',
                'Validation par l\'administration dès réception',
              ],
            }}
            communityId={community.id}
            communityName={community.name}
            isGroupJoin={true}
            onSuccess={() => executeJoin()}
          />
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold text-[11px]">Rappel adhésion :</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Les invités devront également s'acquitter de leur contribution unique de <strong>20 $ CAD par Virement Interac</strong> (à <code>bouffe@newvillages.ca</code>) pour valider leur adhésion.
            </p>
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

      {/* Group Join Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} className="max-w-2xl">
        <PaymentModal
          plan={{
            id: 'group_join',
            label: community.name,
            price: '20 $',
            period: '',
            features: [
              'Adhésion officielle au groupe ' + community.name,
              'Participation à toutes les sorties restaurant',
              'Messagerie et discussions du groupe',
              'Validation par l\'administration requise',
            ],
          }}
          communityId={community.id}
          communityName={community.name}
          isGroupJoin={true}
          onBack={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            executeJoin();
          }}
        />
      </Modal>
    </div>
  );
}
