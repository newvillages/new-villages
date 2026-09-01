import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useCurrentTerms, useRegister, type RegisterRequest } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { UserCircle, Shield, Building2, CheckCircle2, Circle, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';
import { PaymentModal } from '../../components/subscription/PaymentModal';

export function Register() {
  const navigate = useNavigate();
  const { data: terms, isLoading: termsLoading } = useCurrentTerms();
  const registerMutation = useRegister();

  const [role, setRole] = useState<RegisterRequest['accountType']>('MEMBER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Canada');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Français');

  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsOpened, setTermsOpened] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const executeRegistration = () => {
    if (!terms) return;
    registerMutation.mutate(
      {
        fullName,
        email,
        password,
        country,
        city,
        preferredLanguage,
        accountType: role,
        acceptedTermsVersion: terms.version,
      },
      {
        onSuccess: () => navigate('/verify-email', { state: { email } }),
        onError: (err) => {
          setShowPaymentModal(false);
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError('Une erreur est survenue. Veuillez réessayer.');
          }
        },
      }
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!termsAccepted || !terms) return;
    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (role === 'COMMUNITY_LEADER' || role === 'ORGANIZATION') {
      setShowPaymentModal(true);
    } else {
      executeRegistration();
    }
  };

  const openTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    setTermsModalOpen(true);
    setTermsOpened(true);
  };

  const canAccept = termsOpened && !!terms;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-body">
        {/* Minimal Header */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center shrink-0">
              <img src="/logo-bouffe-amitie.png" alt="Bouffe &amp; Amitié" className="h-11 w-auto object-contain" />
            </Link>
            <div className="h-5 w-px bg-slate-300 mx-1" />
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E86225] hover:underline">
              <ArrowLeft size={16} />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
          <Link to="/login" className="text-[#2C1810] font-bold text-xs hover:underline">
            Se connecter &rarr;
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-[900px]">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-[#2C1810] mb-2">Créez votre compte</h1>
              <p className="text-[#52433B] text-base">Rejoignez le club de sorties au restaurant Bouffe &amp; Amitié.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-10">

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              {/* À PROPOS DE VOUS */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#1E4D2B] uppercase tracking-widest">Vos informations personnelles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Nom complet *</label>
                    <Input required placeholder="Marie Tremblay" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white border-[#EFE6DD] rounded-xl py-6 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Adresse courriel *</label>
                    <Input required type="email" placeholder="marie@exemple.ca" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-[#EFE6DD] rounded-xl py-6 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Mot de passe *</label>
                    <Input required type="password" placeholder="••••••••" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-[#EFE6DD] rounded-xl py-6 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Confirmer le mot de passe *</label>
                    <Input required type="password" placeholder="••••••••" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white border-[#EFE6DD] rounded-xl py-6 text-sm" />
                  </div>
                </div>
              </div>

              {/* VOTRE LOCALISATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#1E4D2B] uppercase tracking-widest">Votre arrondissement / ville</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Pays</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-14 rounded-xl border border-[#EFE6DD] bg-white px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E86225] appearance-none text-[#2C1810]">
                      <option>Canada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Ville / Arrondissement *</label>
                    <Input required placeholder="Montréal - Plateau-Mont-Royal" value={city} onChange={(e) => setCity(e.target.value)} className="bg-white border-[#EFE6DD] rounded-xl py-6 h-14 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Langue préférée</label>
                    <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="w-full h-14 rounded-xl border border-[#EFE6DD] bg-white px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E86225] appearance-none text-[#2C1810]">
                      <option>Français</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* JE M'INSCRIS EN TANT QUE... */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#1E4D2B] uppercase tracking-widest">Choisissez votre formule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { id: 'MEMBER' as const, label: 'Membre Gratuit', price: 'Gratuit', icon: UserCircle, desc: 'Consultez les sorties et l\'annuaire des groupes.' },
                    { id: 'COMMUNITY_LEADER' as const, label: 'Organisateur de groupe', price: '20 $/mois CAD', icon: Shield, desc: 'Proposez des restaurants et gérez un groupe.' },
                    { id: 'ORGANIZATION' as const, label: 'Organisation / Resto', price: '20 $/mois CAD', icon: Building2, desc: 'Accueillez des groupes et partenaire officiel.' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setRole(type.id)}
                      className={cn(
                        "flex flex-col text-left p-4 sm:p-6 rounded-2xl border-2 transition-all bg-white shadow-sm relative overflow-hidden",
                        role === type.id
                          ? "border-[#E86225] bg-[#FDF0E9]"
                          : "border-transparent hover:border-[#EFE6DD] text-[#52433B]"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", role === type.id ? "bg-[#E86225] text-white" : "bg-[#FAF5EF] text-[#52433B]")}>
                          <type.icon size={20} />
                        </div>
                        <span className={cn(
                          "text-xs font-extrabold px-2.5 py-1 rounded-full",
                          type.id === 'MEMBER' ? "bg-[#E8F3EB] text-[#1E4D2B]" : "bg-[#FDF0E9] text-[#E86225]"
                        )}>
                          {type.price}
                        </span>
                      </div>
                      <span className={cn("font-bold mb-1 text-sm", role === type.id ? "text-[#E86225]" : "text-[#2C1810]")}>{type.label}</span>
                      <span className="text-xs text-[#52433B] leading-relaxed">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EFE6DD] flex items-start gap-4">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-[#E86225] focus:ring-[#E86225] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={!canAccept}
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#2C1810] mb-2">
                    J'accepte les <a href="#" onClick={openTerms} className="underline text-[#E86225] hover:text-[#D0521B]">Conditions d'utilisation et la Politique de confidentialité</a>
                    {terms && <span className="text-slate-400 font-normal"> (v{terms.version})</span>}.
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#52433B]">
                    {termsOpened ? <CheckCircle2 size={14} className="text-[#1E4D2B]" /> : <Circle size={14} className="text-slate-300" />}
                    {termsLoading ? 'Chargement des conditions…' : 'Conditions consultées'}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full py-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2",
                    termsAccepted ? "bg-[#E86225] hover:bg-[#D0521B] text-white shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                  disabled={!termsAccepted || registerMutation.isPending}
                >
                  {registerMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                  {role === 'MEMBER' ? 'Créer mon compte gratuit' : 'Procéder au paiement (20 $ CAD)'}
                </Button>
                <p className="text-center text-xs text-[#52433B]">
                  Déjà membre ? <Link to="/login" className="text-[#E86225] font-bold hover:underline">Se connecter</Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal for Leader / Org Registration */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} className="max-w-2xl">
        <PaymentModal
          plan={{
            id: role.toLowerCase(),
            label: role === 'COMMUNITY_LEADER' ? 'Organisateur de groupe' : 'Organisation / Resto',
            price: '20 $',
            period: '/mois',
            features: role === 'COMMUNITY_LEADER' 
              ? ['Créer et gérer un groupe d\'arrondissement', 'Proposer de nouvelles sorties au restaurant', 'Badges exclusifs']
              : ['Page d\'organisation vérifiée', 'Partenaire officiel de sorties', 'Accès prioritaire']
          }}
          onBack={() => setShowPaymentModal(false)}
          onSuccess={() => {
            executeRegistration();
          }}
        />
      </Modal>

      {/* Legal Modal */}
      <Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} title={`Conditions d'utilisation & Politique de confidentialité${terms ? ` (v${terms.version})` : ''}`} className="max-w-2xl">
        <div className="prose prose-sm prose-amber whitespace-pre-wrap text-xs text-[#52433B]">
          {terms?.body ?? 'Chargement…'}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => setTermsModalOpen(false)} className="bg-[#E86225] text-white">J'ai compris</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}

export default Register;
