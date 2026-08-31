import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, EyeOff, Trash2, Moon, Sun, UserX, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useThemeStore } from '../../store/useThemeStore';
import { toast } from '../../store/useToastStore';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';
import { useBlockedUsers, useChangePassword, useDeactivateAccount, useUnblockUser } from '../../hooks/useUser';
import { ApiError } from '../../lib/apiClient';

interface ToggleProps { label: string; desc?: string; value: boolean; onChange: () => void; }
const Toggle = ({ label, desc, value, onChange }: ToggleProps) => (
  <div className="flex items-start justify-between gap-4 py-4">
    <div>
      <p className="font-bold text-[#2C1810] text-sm">{label}</p>
      {desc && <p className="text-xs text-[#52433B] mt-0.5 leading-relaxed">{desc}</p>}
    </div>
    <button
      onClick={onChange}
      aria-label={`Toggle ${label}`}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-1 ${value ? 'bg-[#E86225]' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

type TabType = 'appearance' | 'security' | 'notifications' | 'privacy' | 'danger';

export function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [notifs, setNotifs] = useState({ messages: true, events: true, invitations: true, announcements: false });
  const toggle = (k: keyof typeof notifs) => setNotifs(p => ({ ...p, [k]: !p[k] }));

  const { isDark, toggleDark } = useThemeStore();

  const handleThemeToggle = () => {
    toggleDark();
    toast.info(isDark ? '☀️ Mode clair activé' : '🌙 Mode sombre activé');
  };

  // --- Security: change password ---
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Mot de passe mis à jour.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        },
        onError: (err) => setPasswordError(err instanceof ApiError ? err.message : 'Impossible de mettre à jour le mot de passe.'),
      }
    );
  };

  // --- Privacy: blocked users ---
  const { data: blockedUsers } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  // --- Danger zone: deactivate account ---
  const deactivateAccount = useDeactivateAccount();
  const handleDeleteAccount = () => {
    deactivateAccount.mutate(undefined, {
      onSuccess: () => navigate('/'),
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible de supprimer votre compte.'),
    });
  };

  const tabs = [
    { id: 'appearance', label: 'Apparence', icon: isDark ? Moon : Sun, danger: false },
    { id: 'security', label: 'Sécurité', icon: Lock, danger: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, danger: false },
    { id: 'privacy', label: 'Confidentialité', icon: EyeOff, danger: false },
    { id: 'danger', label: 'Zone de danger', icon: Trash2, danger: true },
  ] as const;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 font-body">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-[#2C1810] mb-2">Paramètres</h1>
          <p className="text-xs text-[#52433B]">Gérez vos préférences de compte et la sécurité.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 shrink-0">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none sticky top-24">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-xs whitespace-nowrap",
                      isActive
                        ? (tab.danger ? "bg-red-50 text-red-600" : "bg-[#FAF5EF] text-[#E86225]")
                        : "text-[#52433B] hover:bg-slate-100 hover:text-[#2C1810]"
                    )}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 max-w-3xl">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-1">Apparence</h2>
                  <p className="text-xs text-[#52433B] mb-6">Personnalisez l'affichage de Bouffe &amp; Amitié sur votre appareil.</p>
                </div>
                <Card className="border-[#EFE6DD] shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-0 divide-y divide-[#EFE6DD]">
                    <div className="p-6">
                      <Toggle
                        label="Mode Sombre"
                        desc="Basculez entre l'interface claire et sombre"
                        value={isDark}
                        onChange={handleThemeToggle}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-1">Sécurité du compte</h2>
                  <p className="text-xs text-[#52433B] mb-6">Gérez votre mot de passe et l'authentification.</p>
                </div>
                <Card className="border-[#EFE6DD] shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader><CardTitle className="text-sm font-bold text-[#2C1810]">Changer de mot de passe</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                      {passwordError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2 rounded-lg">
                          {passwordError}
                        </div>
                      )}
                      <input type="password" required placeholder="Mot de passe actuel" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#E86225]" />
                      <input type="password" required minLength={8} placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#E86225]" />
                      <input type="password" required minLength={8} placeholder="Confirmer le nouveau mot de passe" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#E86225]" />
                      <Button type="submit" size="sm" disabled={changePassword.isPending} className="flex items-center gap-2 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-2.5 px-4 rounded-xl text-xs">
                        {changePassword.isPending && <Loader2 size={14} className="animate-spin" />}
                        Mettre à jour le mot de passe
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <Card className="border-[#EFE6DD] shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#2C1810] text-sm mb-1">Authentification à deux facteurs (2FA)</p>
                      <p className="text-xs text-[#52433B]">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                    </div>
                    <Button variant="outline" className="border-[#E86225] text-[#E86225] font-bold text-xs" onClick={() => toast.info('Option 2FA à venir sous peu !')}>Activer 2FA</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-1">Notifications</h2>
                  <p className="text-xs text-[#52433B] mb-6">Choisissez les alertes que vous souhaitez recevoir.</p>
                </div>
                <Card className="border-[#EFE6DD] shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-0 divide-y divide-[#EFE6DD]">
                    <div className="p-6 space-y-2">
                      <Toggle label="Nouveaux messages" desc="M'avertir lorsque je reçois un message privé" value={notifs.messages} onChange={() => toggle('messages')} />
                      <Toggle label="Sorties au restaurant" desc="Lorsqu'une sortie est programmée dans mon groupe" value={notifs.events} onChange={() => toggle('events')} />
                      <Toggle label="Invitations" desc="Lorsque je suis invité(e) à rejoindre un nouveau groupe" value={notifs.invitations} onChange={() => toggle('invitations')} />
                      <Toggle label="Annonces" desc="Mises à jour importantes des organisateurs" value={notifs.announcements} onChange={() => toggle('announcements')} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-1">Confidentialité</h2>
                  <p className="text-xs text-[#52433B] mb-6">Contrôlez la visibilité de votre profil.</p>
                </div>
                <Card className="border-[#EFE6DD] shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-0 divide-y divide-[#EFE6DD]">
                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-[#2C1810] text-sm mb-1">Membres bloqués</p>
                        <p className="text-xs text-[#52433B]">{(blockedUsers?.length ?? 0)} membre{(blockedUsers?.length ?? 0) === 1 ? '' : 's'} bloqué(s)</p>
                      </div>
                      <Button variant="outline" className="border-[#E86225] text-[#E86225] font-bold text-xs" onClick={() => setBlockedModalOpen(true)}>Gérer</Button>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-[#2C1810] text-sm mb-1">Visibilité du profil</p>
                        <p className="text-xs text-[#52433B]">Qui peut voir votre profil complet</p>
                      </div>
                      <select className="h-10 text-xs font-bold border border-[#EFE6DD] rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#E86225] bg-[#FAF5EF] text-[#2C1810] cursor-pointer">
                        <option>Membres du groupe</option>
                        <option>Tout le monde</option>
                        <option>Moi uniquement</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-red-600 mb-1">Zone de danger</h2>
                  <p className="text-xs text-[#52433B] mb-6">Actions irréversibles pour votre compte.</p>
                </div>
                <Card className="border-red-100 shadow-sm rounded-2xl overflow-hidden bg-red-50/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-red-700 text-sm mb-1">Supprimer le compte</p>
                        <p className="text-xs text-red-600/80">Supprimez définitivement votre compte et vos données. Cette action est irréversible.</p>
                      </div>
                      <Button variant="danger" onClick={() => setDeleteOpen(true)} className="shrink-0 bg-red-600 hover:bg-red-700 text-xs font-bold">Supprimer mon compte</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer le compte">
        <div className="space-y-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-xs text-red-800">
            <p className="font-bold mb-2 text-sm">Cette action ne peut pas être annulée.</p>
            <p>Toutes vos données, messages et participations aux groupes seront définitivement supprimés de nos serveurs.</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#2C1810] mb-2">Tapez <strong>SUPPRIMER</strong> pour confirmer :</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-[#EFE6DD] rounded-xl p-4 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="SUPPRIMER"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 py-3 rounded-xl font-bold text-xs" onClick={() => setDeleteOpen(false)}>Annuler</Button>
            <Button
              variant="danger"
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteConfirmText !== 'SUPPRIMER' || deactivateAccount.isPending}
              onClick={handleDeleteAccount}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={blockedModalOpen} onClose={() => setBlockedModalOpen(false)} title="Membres bloqués">
        <div className="space-y-3">
          {(blockedUsers ?? []).length > 0 ? (blockedUsers ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 p-3 border border-[#EFE6DD] rounded-xl">
              <div className="flex items-center gap-3">
                <img src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.id}`} className="w-10 h-10 rounded-full" alt="" />
                <div>
                  <p className="font-bold text-xs text-[#2C1810]">{u.fullName}</p>
                  <p className="text-xs text-[#52433B]">{u.city}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs font-bold" onClick={() => unblockUser.mutate(u.id)} disabled={unblockUser.isPending}>
                <UserX size={14} /> Débloquer
              </Button>
            </div>
          )) : (
            <p className="text-xs text-[#52433B] text-center py-6">Aucun membre bloqué pour le moment.</p>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
}

export default Settings;
