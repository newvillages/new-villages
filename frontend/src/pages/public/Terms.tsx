import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Scale,
  AlertTriangle,
  FileText,
  Lock,
  DollarSign,
  UserX,
  RefreshCw,
  Award,
  ShieldAlert,
  CheckCircle2,
  Mail,
  ExternalLink
} from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';

interface TermItem {
  id: number;
  title: string;
  category: 'conduct' | 'intermediary' | 'financial' | 'legal';
  categoryLabel: string;
  icon: typeof ShieldCheck;
  text: string;
  summary: string;
}

const TERMS_DATA: TermItem[] = [
  {
    id: 1,
    title: 'Conduite et responsabilité de l\'utilisateur',
    category: 'conduct',
    categoryLabel: 'Conduite des membres',
    icon: UserCheck,
    text: 'Les utilisateurs sont responsables de leurs propres publications, messages et comportements sur la plateforme.',
    summary: 'Vous êtes responsable de toutes les activités, messages et contenus publiés sous votre compte.'
  },
  {
    id: 2,
    title: 'Rôle d\'intermédiaire de la plateforme',
    category: 'intermediary',
    categoryLabel: 'Rôle de la plateforme',
    icon: Scale,
    text: 'La plateforme agit uniquement en tant qu\'intermédiaire et n\'est pas responsable des ententes conclues entre les membres.',
    summary: 'Bouffe & Amitié facilite la mise en relation ; les échanges et arrangements entre membres relèvent exclusivement de leur responsabilité.'
  },
  {
    id: 3,
    title: 'Inscription et exactitude du compte',
    category: 'conduct',
    categoryLabel: 'Conduite des membres',
    icon: ShieldCheck,
    text: 'Les utilisateurs doivent fournir des informations exactes et véridiques lors de la création de leur compte.',
    summary: 'Le nom complet, l\'adresse courriel et l\'arrondissement indiqués lors de l\'inscription doivent être exacts.'
  },
  {
    id: 4,
    title: 'Contenus et comportements interdits',
    category: 'conduct',
    categoryLabel: 'Conduite des membres',
    icon: AlertTriangle,
    text: 'Les contenus illégaux, haineux, violents, frauduleux ou portant atteinte aux droits d\'autrui sont strictement interdits.',
    summary: 'Tolérance zéro pour les discours haineux, le harcèlement, la violence, la fraude, le spam ou la violation de la propriété intellectuelle.'
  },
  {
    id: 5,
    title: 'Conformité avec les lois applicables',
    category: 'conduct',
    categoryLabel: 'Conduite des membres',
    icon: FileText,
    text: 'Les utilisateurs doivent se conformer à toutes les lois et réglementations applicables au Canada.',
    summary: 'Toutes les interactions et sorties organisées doivent respecter les lois locales, provinciales et fédérales.'
  },
  {
    id: 6,
    title: 'Abonnements et frais de participation',
    category: 'financial',
    categoryLabel: 'Frais & abonnements',
    icon: CreditCard,
    text: 'Les abonnements et frais de participation doivent être réglés selon les conditions affichées et sont non remboursables sauf disposition légale contraire.',
    summary: 'Les paiements d\'abonnement ou d\'inscription respectent les tarifs publiés et sont non remboursables dans les limites de la loi.'
  },
  {
    id: 7,
    title: 'Responsabilité des dépenses personnelles',
    category: 'financial',
    categoryLabel: 'Frais & abonnements',
    icon: DollarSign,
    text: 'Chaque utilisateur est responsable de ses propres dépenses personnelles lors des sorties (repas, boissons, transport, etc.).',
    summary: 'Les frais encourus au restaurant ou lors du déplacement pour participer à une sortie restent à la charge exclusive de chaque membre.'
  },
  {
    id: 8,
    title: 'Suspension et résiliation de compte',
    category: 'legal',
    categoryLabel: 'Compte & Aspects légaux',
    icon: UserX,
    text: 'La plateforme se réserve le droit de suspendre ou de supprimer définitivement tout compte en cas de non-respect des présentes Conditions.',
    summary: 'Tout manquement aux règles de respect ou aux conditions d\'utilisation peut entraîner la suspension immédiate du compte.'
  },
  {
    id: 9,
    title: 'Modifications des fonctionnalités et des conditions',
    category: 'legal',
    categoryLabel: 'Compte & Aspects légaux',
    icon: RefreshCw,
    text: 'La plateforme peut modifier ses fonctionnalités, ses tarifs ou les présentes Conditions à tout moment. Les modifications prennent effet dès leur publication.',
    summary: 'L\'utilisation continue du service après la publication des modifications vaut acceptation des Conditions mises à jour.'
  },
  {
    id: 10,
    title: 'Absence de garantie sur le déroulement des sorties',
    category: 'intermediary',
    categoryLabel: 'Rôle de la plateforme',
    icon: Award,
    text: 'La plateforme ne garantit pas le déroulement ou la qualité des rencontres individuelles entre membres.',
    summary: 'Les sorties sont des moments d\'échange entre adultes consentants organisés de manière bienveillante.'
  },
  {
    id: 11,
    title: 'Limitation de responsabilité',
    category: 'intermediary',
    categoryLabel: 'Rôle de la plateforme',
    icon: ShieldAlert,
    text: 'Dans toute la mesure permise par la loi, la plateforme ne peut être tenue responsable des dommages directes ou indirects survenant lors d\'une sortie.',
    summary: 'Bouffe & Amitié n\'assume pas de responsabilité civile pour les différends personnels ou pertes survenus entre membres.'
  },
  {
    id: 12,
    title: 'Protection de la vie privée et des données',
    category: 'legal',
    categoryLabel: 'Compte & Aspects légaux',
    icon: Lock,
    text: 'Les utilisateurs acceptent la Politique de confidentialité concernant la collecte et le traitement de leurs renseignements personnels.',
    summary: 'Le traitement des données personnelles respecte scrupuleusement notre Politique de confidentialité.'
  },
  {
    id: 13,
    title: 'Prévention de la fraude et sécurité',
    category: 'legal',
    categoryLabel: 'Compte & Aspects légaux',
    icon: Lock,
    text: 'Toute tentative d\'accès non autorisé ou de contournement des mesures de sécurité entraînera la fermeture du compte.',
    summary: 'Toute tentative de piratage, d\'accès non autorisé ou de fraude entraînera des poursuites légales.'
  },
  {
    id: 14,
    title: 'Accord contraignant et acceptation',
    category: 'legal',
    categoryLabel: 'Compte & Aspects légaux',
    icon: CheckCircle2,
    text: 'En accédant à la plateforme ou en créant un compte, l\'utilisateur confirme avoir lu, compris et accepté les présentes Conditions d\'utilisation.',
    summary: 'L\'utilisation de Bouffe & Amitié constitue une acceptation sans réserve des présentes conditions.'
  }
];

export function Terms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'conduct' | 'intermediary' | 'financial' | 'legal'>('all');

  const filteredTerms = TERMS_DATA.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString() === searchQuery.trim();
    return matchesTab && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C1810] flex flex-col font-body">
        {/* Header Hero */}
        <section className="bg-[#133820] text-white py-16 md:py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-[#E8F3EB] hover:text-white font-bold transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/10"
              >
                <ArrowLeft size={16} className="mr-2" /> Retour à l'accueil
              </Link>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                <span className="bg-[#E86225] text-white px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">Document Officiel</span>
                <span>Version 1.0.0</span>
                <span>&bull;</span>
                <span>Dernière mise à jour : Août 2026</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-4">
                Conditions d'utilisation
              </h1>
              <p className="text-base md:text-lg text-emerald-100/90 leading-relaxed font-light">
                Veuillez lire attentivement ces conditions d'utilisation. Elles régissent l'accès et l'utilisation de la plateforme **Bouffe &amp; Amitié**, de ses services et de son réseau de sorties au restaurant.
              </p>
            </div>

            {/* Actions & Quick Stats */}
            <div className="mt-10 pt-8 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs sm:text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#E86225]" />
                  <span>14 clauses d'utilisation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#E86225]" />
                  <span>Charte de bienveillance</span>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl transition-all border border-white/20 text-xs"
              >
                <Printer size={16} />
                <span>Imprimer / Sauvegarder PDF</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-10">

          {/* Search & Filter Control Bar */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#EFE6DD] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une clause par mot-clé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FAF5EF] border border-[#EFE6DD] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E86225] focus:bg-white transition-all text-[#2C1810]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Toutes les clauses' },
                { id: 'conduct', label: 'Conduite' },
                { id: 'intermediary', label: 'Rôle du club' },
                { id: 'financial', label: 'Frais' },
                { id: 'legal', label: 'Aspects légaux' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#E86225] text-white shadow-sm'
                      : 'bg-[#FAF5EF] text-[#52433B] hover:bg-[#E8F3EB]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Principles Summary Box */}
          <div className="bg-[#133820] text-white rounded-2xl p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="text-[#E86225]" size={22} />
              Principes fondamentaux du club
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div className="bg-[#164025] p-4 rounded-xl border border-[#215933]">
                <h4 className="font-bold text-sm text-white mb-1">1. Respect &amp; Bienveillance</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Chaque membre s'engage à faire preuve d'ouverture et de courtoisie lors des rencontres.
                </p>
              </div>
              <div className="bg-[#164025] p-4 rounded-xl border border-[#215933]">
                <h4 className="font-bold text-sm text-[#E86225] mb-1">2. Rôle d'intermédiaire</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Bouffe &amp; Amitié facilite les sorties au restaurant mais n'intervient pas dans la vie privée des membres.
                </p>
              </div>
              <div className="bg-[#164025] p-4 rounded-xl border border-[#215933]">
                <h4 className="font-bold text-sm text-white mb-1">3. Consentement éclairé</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  La création d'un compte requiert l'acceptation expresse des présentes conditions d'utilisation.
                </p>
              </div>
            </div>
          </div>

          {/* Terms List Grid / Cards */}
          {filteredTerms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#EFE6DD]">
              <AlertTriangle size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-[#2C1810] mb-1">Aucune clause trouvée</h3>
              <p className="text-xs text-[#52433B] max-w-md mx-auto mb-4">
                Aucune clause ne correspond à votre recherche "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="text-xs font-bold text-[#E86225] hover:underline"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTerms.map((term) => {
                const IconComponent = term.icon;
                return (
                  <article
                    key={term.id}
                    id={`term-${term.id}`}
                    className="bg-white rounded-2xl border border-[#EFE6DD] p-6 md:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-5">
                      {/* Number Badge & Icon */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#133820] text-white font-black text-lg flex items-center justify-center border border-[#1E4D2B]">
                          {term.id}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#FDF0E9] text-[#E86225] flex items-center justify-center md:hidden">
                          <IconComponent size={20} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xl font-bold text-[#2C1810] group-hover:text-[#E86225] transition-colors">
                            {term.id}. {term.title}
                          </h3>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-[#FAF5EF] text-[#52433B] rounded-full">
                            {term.categoryLabel}
                          </span>
                        </div>

                        {/* Clause Text */}
                        <div className="bg-[#FAF5EF] p-4 rounded-xl border border-[#EFE6DD]">
                          <p className="text-sm text-[#2C1810] font-medium leading-relaxed">
                            « {term.text} »
                          </p>
                        </div>

                        {/* Summary */}
                        <p className="text-xs text-[#52433B] leading-relaxed flex items-start gap-1.5">
                          <span className="font-bold text-[#2C1810] shrink-0">En résumé :</span>
                          <span>{term.summary}</span>
                        </p>
                      </div>

                      {/* Icon Desktop */}
                      <div className="hidden md:flex w-12 h-12 rounded-2xl bg-[#FDF0E9] text-[#E86225] items-center justify-center shrink-0">
                        <IconComponent size={24} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Additional Links & Support */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#EFE6DD] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-lg text-[#2C1810] mb-1">Des questions sur nos conditions ?</h4>
              <p className="text-xs text-[#52433B]">
                Si vous souhaitez obtenir des précisions sur le fonctionnement du club, n'hésitez pas à nous contacter.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#2C1810] hover:underline px-4 py-2.5 rounded-xl border border-[#EFE6DD]"
              >
                <span>Politique de confidentialité</span>
                <ExternalLink size={14} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#E86225] hover:bg-[#D0521B] px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Mail size={14} />
                <span>Nous contacter</span>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </PageTransition>
  );
}

export default Terms;
