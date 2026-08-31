import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useCreateOrganization, useMyOrganization, useOrganization, useUpdateOrganization } from '../../hooks/useOrganizations';
import { useCommunitySearch } from '../../hooks/useCommunities';
import { useStartConversation } from '../../hooks/useMessaging';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';
import type { Organization } from '../../types/organization';

export function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const isMine = id === 'me';
  const currentUser = useStore((s) => s.currentUser);

  const myOrgQuery = useMyOrganization();
  const otherOrgQuery = useOrganization(isMine ? undefined : id);
  const org = isMine ? myOrgQuery.data : otherOrgQuery.data;
  const isLoading = isMine ? myOrgQuery.isLoading : otherOrgQuery.isLoading;

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#E86225]" size={32} /></div>;
  }

  if (isMine && !org) {
    return <CreateOrganizationForm />;
  }

  if (!org) {
    return <div className="text-center py-24 text-[#52433B]">Cette page d'organisation est introuvable.</div>;
  }

  const canEdit = org.ownerUserId === currentUser?.id;
  return <OrganizationView org={org} canEdit={canEdit} />;
}

function CreateOrganizationForm() {
  const createOrg = useCreateOrganization();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [services, setServices] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createOrg.mutate(
      { name, description, contactEmail, services },
      { onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Impossible de créer la page d\'organisation.') }
    );
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 font-body">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FDF0E9] rounded-2xl flex items-center justify-center text-[#E86225] mx-auto mb-4">
          <Building2 size={32} />
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-[#2C1810]">Créez votre page d'organisation</h1>
        <p className="text-[#52433B] text-xs mt-1">Présentez votre restaurant ou organisation au club Bouffe &amp; Amitié.</p>
      </div>
      <Card className="border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">{formError}</div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Nom de l'organisation / restaurant *</label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="ex. Bistrot du Plateau" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Courriel de contact</label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@bistrot.ca" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">À propos</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225]" rows={3} placeholder="Présentez votre établissement ou vos activités..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Services &amp; Offres spéciales</label>
              <textarea value={services} onChange={e => setServices(e.target.value)} className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225]" rows={3} placeholder="Menu spécial pour groupes, réductions..." />
            </div>
            <Button type="submit" className="w-full bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3 rounded-xl text-xs" disabled={createOrg.isPending}>
              {createOrg.isPending ? 'Création…' : 'Créer la page d\'organisation'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationView({ org, canEdit }: { org: Organization; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: org.name,
    description: org.description ?? '',
    contactEmail: org.contactEmail ?? '',
    services: org.services ?? '',
  });

  const updateOrg = useUpdateOrganization(org.id);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [proposalCommunityId, setProposalCommunityId] = useState('');
  const [proposalText, setProposalText] = useState('');
  const { data: communitiesPage } = useCommunitySearch('', '', 0, 50);
  const startConversation = useStartConversation();

  const handleSave = () => {
    updateOrg.mutate(form, {
      onSuccess: () => {
        setEditing(false);
        toast.success('Page d\'organisation mise à jour.');
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible d\'enregistrer les modifications.'),
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalCommunityId || !proposalText.trim()) return;
    startConversation.mutate(
      { type: 'LEADER', communityId: proposalCommunityId, initialMessage: proposalText },
      {
        onSuccess: () => setContactSuccess(true),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible d\'envoyer la proposition.'),
      }
    );
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-6 w-full font-body">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-extrabold text-[#2C1810]">Profil de l'organisation</h1>
        {canEdit && (
          !editing ? (
            <Button variant="outline" className="border-[#E86225] text-[#E86225] font-bold text-xs" onClick={() => setEditing(true)}>Modifier les détails</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs font-bold" onClick={() => setEditing(false)}>Annuler</Button>
              <Button className="bg-[#E86225] text-white font-bold text-xs" onClick={handleSave} disabled={updateOrg.isPending}>{updateOrg.isPending ? 'Enregistrement…' : 'Enregistrer'}</Button>
            </div>
          )
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column info */}
        <div className="space-y-6">
          <Card className="border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 bg-[#FDF0E9] rounded-2xl flex items-center justify-center text-[#E86225] mx-auto overflow-hidden">
                {org.logoUrl ? <img src={org.logoUrl} alt="" className="w-full h-full object-cover" /> : <Building2 size={40} />}
              </div>
              <div>
                {editing
                  ? <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="text-center font-bold text-xs" />
                  : <h2 className="font-heading font-extrabold text-xl text-[#2C1810]">{org.name}</h2>}
                <span className="text-xs font-bold bg-[#E8F3EB] text-[#1E4D2B] px-3 py-1 rounded-full mt-2 inline-block">Organisation Partenaire</span>
              </div>
              <div className="text-xs text-[#52433B] space-y-2 pt-2 border-t border-[#EFE6DD] text-left">
                {editing
                  ? <Input value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} icon={<Mail size={16} />} />
                  : <p className="flex items-center gap-2"><Mail size={16} className="text-[#E86225]"/>{org.contactEmail || 'Aucun courriel renseigné'}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-extrabold text-lg text-[#2C1810]">À propos</h3>
              {editing ? (
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225]"
                  rows={4}
                />
              ) : (
                <p className="text-[#52433B] text-xs leading-relaxed">{org.description || 'Aucune description pour le moment.'}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-extrabold text-lg text-[#2C1810]">Services &amp; Offres proposées</h3>
              {editing ? (
                <textarea
                  value={form.services}
                  onChange={e => setForm(prev => ({ ...prev, services: e.target.value }))}
                  className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225]"
                  rows={4}
                />
              ) : (
                <p className="text-[#52433B] text-xs leading-relaxed whitespace-pre-wrap">{org.services || 'Aucun service affiché pour le moment.'}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-extrabold text-lg text-[#2C1810]">Contacter les responsables de groupe</h3>
              <p className="text-xs text-[#52433B]">Envoyez une offre de partenariat ou de réservation de groupe.</p>

              {contactSuccess ? (
                <div className="bg-[#E8F3EB] border border-[#1E4D2B]/30 rounded-xl p-4 text-xs text-[#1E4D2B] font-bold">
                  Proposition envoyée avec succès !
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-[#2C1810]">Sélectionner un groupe d'arrondissement</label>
                    <select value={proposalCommunityId} onChange={e => setProposalCommunityId(e.target.value)} required className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs focus:ring-[#E86225] focus:outline-none bg-[#FAF5EF]">
                      <option value="" disabled>Sélectionner un groupe</option>
                      {(communitiesPage?.content ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-[#2C1810]">Détails de la proposition</label>
                    <textarea value={proposalText} onChange={e => setProposalText(e.target.value)} className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225]" rows={3} placeholder="Proposez une réservation de table ou un menu groupe..." required />
                  </div>
                  <Button type="submit" size="sm" className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-2.5 px-4 rounded-xl text-xs" disabled={startConversation.isPending}>
                    {startConversation.isPending ? 'Envoi…' : 'Envoyer la proposition'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OrganizationPage;
