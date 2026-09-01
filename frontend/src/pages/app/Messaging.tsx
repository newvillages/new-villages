import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MoreVertical, Flag, Ban, PlusCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';
import { useConversations, useMessages, useSendMessage, useStartConversation } from '../../hooks/useMessaging';
import { useMyCommunities, useCommunityMembers } from '../../hooks/useCommunities';
import { useOrganizationsList } from '../../hooks/useOrganizations';
import { useBlockUser } from '../../hooks/useUser';
import { useSubmitReport } from '../../hooks/useReports';
import { ApiError } from '../../lib/apiClient';
import { toast } from '../../store/useToastStore';
import { useStore } from '../../store/useStore';

export function Messaging() {
  const location = useLocation();
  const stateLocation = location.state as { targetUserId?: string; targetUserName?: string } | null;
  const currentUser = useStore((s) => s.currentUser);

  const { data: conversations } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobileThread, setShowMobileThread] = useState(false);

  useEffect(() => {
    if (!selectedId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selected = (conversations ?? []).find((c) => c.id === selectedId) ?? null;

  const { data: messagesPage } = useMessages(selected?.id);
  const sendMessage = useSendMessage(selected?.id ?? '');
  const startConversation = useStartConversation();
  const blockUser = useBlockUser();
  const submitReport = useSubmitReport();

  const [draft, setDraft] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const [composeTo, setComposeTo] = useState<'LEADER' | 'ORG' | 'ADMIN' | 'USER'>('LEADER');
  const [composeCommunityId, setComposeCommunityId] = useState('');
  const [composeOrgId, setComposeOrgId] = useState('');
  const [composeTargetUserId, setComposeTargetUserId] = useState('');
  const [composeText, setComposeText] = useState('');
  const [reportReason, setReportReason] = useState('');

  const { data: myCommunities } = useMyCommunities();
  const { data: organizations } = useOrganizationsList();
  const { data: rosterMembers, isLoading: rosterLoading } = useCommunityMembers(
    composeTo === 'USER' ? composeCommunityId : undefined
  );

  useEffect(() => {
    if (stateLocation?.targetUserId) {
      setComposeTo('USER');
      setComposeTargetUserId(stateLocation.targetUserId);
      setComposeOpen(true);
    }
  }, [stateLocation]);

  const messages = messagesPage?.content?.slice().reverse() ?? [];

  const formatRoleName = (role?: string | null) => {
    if (!role) return 'Membre';
    switch (role.toUpperCase()) {
      case 'COMMUNITY_LEADER':
        return 'Organisateur de groupe';
      case 'ORGANIZATION':
        return 'Organisation partenaire';
      case 'ADMIN':
        return 'Administrateur';
      case 'PREMIUM_MEMBER':
        return 'Membre Privilège';
      default:
        return 'Membre';
    }
  };

  const sendCurrentMessage = () => {
    if (!draft.trim() || !selected) return;
    sendMessage.mutate(draft, {
      onSuccess: () => setDraft(''),
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible d\'envoyer le message.'),
    });
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeText.trim()) return;

    startConversation.mutate(
      {
        type: composeTo,
        communityId: composeTo === 'LEADER' ? composeCommunityId : undefined,
        organizationId: composeTo === 'ORG' ? composeOrgId : undefined,
        targetUserId: composeTo === 'USER' ? composeTargetUserId : undefined,
        initialMessage: composeText,
      },
      {
        onSuccess: (conversation) => {
          setSelectedId(conversation.id);
          setShowMobileThread(true);
          setComposeText('');
          setComposeOpen(false);
        },
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible de démarrer la conversation.'),
      }
    );
  };

  const handleBlock = () => {
    if (!selected) return;
    blockUser.mutate(selected.otherUserId, {
      onSuccess: () => {
        toast.info(`${selected.otherUserName ?? 'Cet utilisateur'} a été bloqué.`);
        setBlockOpen(false);
      },
    });
  };

  const handleReport = () => {
    if (!selected || !reportReason) return;
    submitReport.mutate(
      { targetType: 'USER', targetId: selected.otherUserId, reason: reportReason },
      {
        onSuccess: () => {
          toast.success('Signalement transmis à l\'équipe de modération.');
          setReportOpen(false);
          setReportReason('');
        },
      }
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex overflow-hidden font-body text-[#2C1810] bg-[#FDFBF7]">
      {/* Conversation List */}
      <div
        className={cn(
          'w-full md:w-80 border-r border-[#EFE6DD] bg-white flex flex-col shrink-0',
          showMobileThread ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="p-4 border-b border-[#EFE6DD] flex items-center justify-between gap-2">
          <h2 className="text-xl font-heading font-extrabold text-[#2C1810]">Messagerie</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setComposeOpen(true)}
            className="p-1 hover:bg-[#FAF5EF] rounded-full text-[#E86225]"
            title="Nouveau message"
          >
            <PlusCircle size={22} className="text-[#E86225]" />
          </Button>
        </div>
        <div className="p-3 border-b border-[#EFE6DD]">
          <Input placeholder="Rechercher dans les messages..." className="bg-[#FAF5EF] border-[#EFE6DD] text-xs text-[#2C1810]" />
        </div>
        <div className="overflow-y-auto flex-1">
          {(conversations ?? []).length === 0 && (
            <div className="text-center text-[#52433B]/60 text-xs p-8">
              Aucune conversation pour l'instant. Démarrer avec le bouton + ci-dessus.
            </div>
          )}
          {(conversations ?? []).map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedId(conv.id);
                setShowMobileThread(true);
              }}
              className={cn(
                'w-full flex items-start gap-3 p-4 hover:bg-[#FAF5EF] transition-colors border-b border-[#EFE6DD] text-left cursor-pointer',
                selected?.id === conv.id && 'bg-[#FDF0E9] border-l-4 border-l-[#E86225]'
              )}
            >
              <div className="relative shrink-0">
                <img
                  src={conv.otherUserAvatar || `https://i.pravatar.cc/150?u=${conv.otherUserId}`}
                  alt=""
                  className="w-12 h-12 rounded-full border border-[#EFE6DD] object-cover"
                />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E86225] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#2C1810] text-sm">{conv.otherUserName ?? 'Membre'}</p>
                    <p className="text-xs text-[#E86225] font-semibold">
                      {formatRoleName(conv.otherUserRole)}
                    </p>
                  </div>
                  {conv.lastMessageAt && (
                    <p className="text-[10px] text-[#52433B]/60 shrink-0">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <p className="text-xs text-[#52433B] truncate mt-1">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      {selected ? (
        <div className={cn('flex-1 flex flex-col bg-[#FAF5EF] min-w-0', !showMobileThread ? 'hidden md:flex' : 'flex')}>
          <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-[#EFE6DD]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileThread(false)}
                className="md:hidden p-1.5 -ml-1 text-[#52433B] hover:bg-[#FAF5EF] rounded-full transition-colors"
                title="Retour aux messages"
              >
                <ArrowLeft size={20} />
              </button>
              <img
                src={selected.otherUserAvatar || `https://i.pravatar.cc/150?u=${selected.otherUserId}`}
                alt=""
                className="w-10 h-10 rounded-full border border-[#EFE6DD] object-cover"
              />
              <div>
                <p className="font-bold text-[#2C1810]">{selected.otherUserName ?? 'Membre'}</p>
                <p className="text-xs text-[#E86225] font-semibold">
                  {formatRoleName(selected.otherUserRole)}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-[#FAF5EF] rounded-full transition-colors cursor-pointer"
              >
                <MoreVertical size={20} className="text-[#52433B]" />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-10 bg-white border border-[#EFE6DD] rounded-xl shadow-lg py-1.5 w-48 z-10">
                  <button
                    onClick={() => {
                      setReportOpen(true);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Flag size={14} /> Signaler cet utilisateur
                  </button>
                  <button
                    onClick={() => {
                      setBlockOpen(true);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#52433B] hover:bg-[#FAF5EF] transition-colors cursor-pointer"
                  >
                    <Ban size={14} /> Bloquer cet utilisateur
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.mine
                      ? 'bg-[#E86225] text-white rounded-tr-sm shadow-sm'
                      : 'bg-white text-[#2C1810] border border-[#EFE6DD] rounded-tl-sm shadow-sm'
                  )}
                >
                  <p>{msg.body}</p>
                  <p className={cn('text-[10px] mt-1', msg.mine ? 'text-white/80 text-right' : 'text-[#52433B]/60')}>
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-[#EFE6DD] mb-16 md:mb-0">
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCurrentMessage()}
                  placeholder="Écrivez votre message..."
                  className="rounded-full bg-[#FAF5EF] border-[#EFE6DD] text-sm text-[#2C1810]"
                />
              </div>
              <Button onClick={sendCurrentMessage} disabled={sendMessage.isPending} className="bg-[#E86225] hover:bg-[#D0521B] text-white rounded-full w-10 h-10 p-0 shrink-0 flex items-center justify-center cursor-pointer">
                {sendMessage.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn('flex-1 flex items-center justify-center text-[#52433B]/60 text-sm bg-[#FAF5EF]', !showMobileThread ? 'hidden md:flex' : 'flex')}>
          Sélectionnez une conversation ou démarrez-en une nouvelle.
        </div>
      )}

      {/* Compose Message Modal */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="Démarrer une nouvelle conversation">
        <form onSubmit={handleComposeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Destinataire</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'LEADER' as const, label: 'Organisateur' },
                { id: 'USER' as const, label: 'Membre' },
                { id: 'ORG' as const, label: 'Partenaire' },
                { id: 'ADMIN' as const, label: 'Admin' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setComposeTo(opt.id)}
                  className={cn(
                    'py-2 text-xs border rounded-xl font-bold cursor-pointer transition-colors',
                    composeTo === opt.id ? 'border-[#E86225] bg-[#FDF0E9] text-[#E86225]' : 'border-[#EFE6DD] text-[#52433B] hover:bg-[#FAF5EF]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {composeTo === 'LEADER' && (
            <div>
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Groupe d'arrondissement</label>
              <select
                value={composeCommunityId}
                onChange={(e) => setComposeCommunityId(e.target.value)}
                required
                className="w-full border border-[#EFE6DD] rounded-xl p-2.5 text-sm bg-[#FAF5EF] focus:ring-[#E86225] focus:outline-none font-medium text-[#2C1810]"
              >
                <option value="" disabled>
                  Sélectionnez un groupe
                </option>
                {(myCommunities ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {composeTo === 'USER' && (
            <div className="space-y-3">
              {stateLocation?.targetUserId && composeTargetUserId === stateLocation.targetUserId ? (
                <div className="bg-[#FDF0E9] border border-[#E86225]/30 rounded-xl p-3 flex items-center justify-between text-xs text-[#E86225] font-bold">
                  <span>Membre sélectionné : {stateLocation.targetUserName || 'Membre du groupe'}</span>
                  <button
                    type="button"
                    onClick={() => setComposeTargetUserId('')}
                    className="underline text-[#52433B] hover:text-[#2C1810]"
                  >
                    Changer de membre
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Groupe d'arrondissement</label>
                    <select
                      value={composeCommunityId}
                      onChange={(e) => {
                        setComposeCommunityId(e.target.value);
                        setComposeTargetUserId('');
                      }}
                      required={!composeTargetUserId}
                      className="w-full border border-[#EFE6DD] rounded-xl p-2.5 text-sm bg-[#FAF5EF] focus:ring-[#E86225] focus:outline-none text-[#2C1810]"
                    >
                      <option value="" disabled>
                        Choisissez un groupe pour voir la liste des membres...
                      </option>
                      {(myCommunities ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {composeCommunityId && (
                    <div>
                      <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Membre de la communauté</label>
                      {rosterLoading ? (
                        <p className="text-xs text-gray-400 py-2">Chargement des membres...</p>
                      ) : (
                        <select
                          value={composeTargetUserId}
                          onChange={(e) => setComposeTargetUserId(e.target.value)}
                          required
                          className="w-full border border-[#EFE6DD] rounded-xl p-2.5 text-sm bg-[#FAF5EF] focus:ring-[#E86225] focus:outline-none text-[#2C1810]"
                        >
                          <option value="" disabled>
                            Sélectionnez un membre...
                          </option>
                          {(rosterMembers ?? [])
                            .filter((m) => m.userId !== currentUser?.id)
                            .map((m) => (
                              <option key={m.userId} value={m.userId}>
                                {m.fullName || 'Membre'}
                                {m.city ? ` — ${m.city}` : ''}
                                {m.email ? ` (${m.email})` : ''}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {composeTo === 'ORG' && (
            <div>
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Organisation partenaire</label>
              <select
                value={composeOrgId}
                onChange={(e) => setComposeOrgId(e.target.value)}
                required
                className="w-full border border-[#EFE6DD] rounded-xl p-2.5 text-sm bg-[#FAF5EF] focus:ring-[#E86225] focus:outline-none text-[#2C1810]"
              >
                <option value="" disabled>
                  Sélectionnez une organisation
                </option>
                {(organizations ?? []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1.5">Premier message</label>
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              className="w-full border border-[#EFE6DD] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225] bg-[#FAF5EF] text-[#2C1810]"
              rows={4}
              placeholder="Rédigez votre message privé..."
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={() => setComposeOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl" disabled={startConversation.isPending}>
              {startConversation.isPending ? 'Envoi…' : 'Envoyer le message'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Signaler un utilisateur">
        <div className="space-y-4">
          <p className="text-[#52433B] text-sm">Veuillez sélectionner un motif. Notre équipe de modération examinera votre signalement.</p>
          <div className="space-y-2">
            {['Harcèlement ou comportement irrespectueux', 'Spam ou contenu indésirable', 'Propos haineux', 'Contenu inapproprié', 'Autre infraction aux règles'].map((r) => (
              <label key={r} className="flex items-center gap-3 p-3 border border-[#EFE6DD] rounded-xl cursor-pointer hover:bg-[#FAF5EF]">
                <input type="radio" name="reason" value={r} onChange={(e) => setReportReason(e.target.value)} className="text-[#E86225] focus:ring-[#E86225]" />
                <span className="text-xs font-medium text-[#2C1810]">{r}</span>
              </label>
            ))}
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl" onClick={handleReport} disabled={!reportReason || submitReport.isPending}>
            {submitReport.isPending ? 'Transmission…' : 'Soumettre le signalement'}
          </Button>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal isOpen={blockOpen} onClose={() => setBlockOpen(false)} title="Bloquer un utilisateur">
        <div className="space-y-4">
          <p className="text-[#52433B] text-sm">
            Êtes-vous sûr de vouloir bloquer <strong>{selected?.otherUserName}</strong> ? Cette personne ne pourra plus vous envoyer de messages.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setBlockOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleBlock} disabled={blockUser.isPending}>
              Bloquer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
