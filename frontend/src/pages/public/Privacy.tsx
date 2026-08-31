import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  Shield,
  Lock,
  Eye,
  Share2,
  UserCheck,
  CheckCircle2,
  Mail,
  ExternalLink,
  Database,
  Key,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';

interface PrivacyPillar {
  id: number;
  title: string;
  category: 'collection' | 'usage' | 'sharing' | 'rights' | 'security';
  categoryLabel: string;
  icon: typeof Shield;
  text: string;
  summary: string;
}

const PRIVACY_PILLARS: PrivacyPillar[] = [
  {
    id: 1,
    title: 'Renseignements que nous collectons',
    category: 'collection',
    categoryLabel: 'Collecte de données',
    icon: Database,
    text: 'Nous collectons uniquement les informations que vous nous fournissez directement lors de la création de votre compte ou de la mise à jour de votre profil : votre nom complet, votre adresse courriel, votre arrondissement et vos préférences de sortie.',
    summary: 'Seules les données nécessaires au bon fonctionnement de votre compte et à votre participation aux sorties sont collectées.'
  },
  {
    id: 2,
    title: 'Utilisation de vos renseignements',
    category: 'usage',
    categoryLabel: 'Utilisation des données',
    icon: Eye,
    text: 'Vos informations sont utilisées exclusivement pour vous proposer des sorties au restaurant dans votre secteur, gérer vos réservations, assurer la sécurité des membres et vous transmettre les détails des événements.',
    summary: 'Vos données servent uniquement à organiser les rencontres et à sécuriser la communauté.'
  },
  {
    id: 3,
    title: 'Non-vente et confidentialité des données',
    category: 'sharing',
    categoryLabel: 'Partage de données',
    icon: Share2,
    text: 'Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos informations sont partagées uniquement avec nos prestataires techniques indispensables (traitement des paiements sécurisés et envoi de courriels).',
    summary: 'Aucune revente de données personnelles à des annonceurs ou des tiers commerciaux.'
  },
  {
    id: 4,
    title: 'Vos droits et votre contrôle sur vos données',
    category: 'rights',
    categoryLabel: 'Droits des membres',
    icon: UserCheck,
    text: 'Vous avez le droit de consulter, modifier, exporter ou supprimer vos données personnelles à tout moment depuis les paramètres de votre compte ou sur simple demande.',
    summary: 'Vous gardez le contrôle total sur vos renseignements personnels et pouvez demander la suppression de votre compte.'
  },
  {
    id: 5,
    title: 'Mesures de sécurité et chiffrement',
    category: 'security',
    categoryLabel: 'Sécurité',
    icon: Lock,
    text: 'Nous appliquons des standards de sécurité rigoureux : chiffrement HTTPS, hachage sécurisé des mots de passe et jetons de session protégés pour préserver la confidentialité de vos échanges.',
    summary: 'Vos données sont chiffrées et protégées selon les normes de sécurité canadiennes.'
  }
];

export function Privacy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'collection' | 'usage' | 'sharing' | 'rights' | 'security'>('all');

  const filteredPillars = PRIVACY_PILLARS.filter((item) => {
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
                <span className="bg-[#E86225] text-white px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">Politique Officielle</span>
                <span>Version 1.0.0</span>
                <span>&bull;</span>
                <span>Dernière mise à jour : Août 2026</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-4">
                Politique de confidentialité
              </h1>
              <p className="text-base md:text-lg text-emerald-100/90 leading-relaxed font-light">
                La protection de votre vie privée est essentielle. Découvrez comment **Bouffe &amp; Amitié** protège vos renseignements personnels en toute transparence.
              </p>
            </div>

            {/* Actions & Quick Highlights */}
            <div className="mt-10 pt-8 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs sm:text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#E86225]" />
                  <span>Aucune revente de données</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-[#E86225]" />
                  <span>Chiffrement sécurisé</span>
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

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-10">

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#EFE6DD] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé (ex: chiffrement, droits, courriel)..."
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

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Toutes les catégories' },
                { id: 'collection', label: 'Collecte' },
                { id: 'usage', label: 'Utilisation' },
                { id: 'sharing', label: 'Partage' },
                { id: 'rights', label: 'Vos droits' },
                { id: 'security', label: 'Sécurité' }
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

          {/* Privacy Guarantees Summary */}
          <div className="bg-[#133820] text-white rounded-2xl p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="text-[#E86225]" size={22} />
              Engagements clés pour la protection de vos données
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div className="bg-[#164025] p-4 rounded-xl border border-[#215933]">
                <h4 className="font-bold text-sm text-white mb-1">1. Transparence totale</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Nous ne demandons que les renseignements nécessaires pour organiser vos sorties au restaurant.
                </p>
              </div>
              <div className="bg-[#164025] p-4 rounded-xl border border-[#215933]">
                <h4 className="font-bold text-sm text-[#E86225] mb-1">2. Zéro exploitation commerciale</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Vos informations personnelles ne sont jamais vendues ou cédées à des réseaux publicitaires.
                </p>
              </div>
              <div className="bg-[#164025] p-4 rounded-xl border border-[#215933]">
                <h4 className="font-bold text-sm text-white mb-1">3. Maîtrise de votre compte</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Vous pouvez modifier vos préférences ou supprimer votre compte en tout temps.
                </p>
              </div>
            </div>
          </div>

          {/* Pillars Cards */}
          {filteredPillars.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#EFE6DD]">
              <AlertTriangle size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-[#2C1810] mb-1">Aucune section trouvée</h3>
              <p className="text-xs text-[#52433B] max-w-md mx-auto mb-4">
                Aucun chapitre ne correspond à votre recherche "{searchQuery}".
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
              {filteredPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <article
                    key={pillar.id}
                    className="bg-white rounded-2xl border border-[#EFE6DD] p-6 md:p-8 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-5">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#133820] text-white font-black text-lg flex items-center justify-center border border-[#1E4D2B]">
                          0{pillar.id}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#FDF0E9] text-[#E86225] flex items-center justify-center md:hidden">
                          <IconComponent size={20} />
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xl font-bold text-[#2C1810] group-hover:text-[#E86225] transition-colors">
                            {pillar.id}. {pillar.title}
                          </h3>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-[#FAF5EF] text-[#52433B] rounded-full">
                            {pillar.categoryLabel}
                          </span>
                        </div>

                        <div className="bg-[#FAF5EF] p-4 rounded-xl border border-[#EFE6DD]">
                          <p className="text-sm text-[#2C1810] font-medium leading-relaxed">
                            {pillar.text}
                          </p>
                        </div>

                        <p className="text-xs text-[#52433B] leading-relaxed flex items-start gap-1.5">
                          <span className="font-bold text-[#2C1810] shrink-0">L'essentiel :</span>
                          <span>{pillar.summary}</span>
                        </p>
                      </div>

                      <div className="hidden md:flex w-12 h-12 rounded-2xl bg-[#FDF0E9] text-[#E86225] items-center justify-center shrink-0">
                        <IconComponent size={24} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* User Controls Box */}
          <section className="bg-gradient-to-r from-[#133820] to-[#164025] text-white rounded-3xl p-8 md:p-10 shadow-lg">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-[#E86225]">
                Conformité aux lois canadiennes (LPRPDE / Loi 25)
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
                Gestion de vos données personnelles
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed font-light">
                Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez modifier vos paramètres à tout moment.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 bg-white text-[#133820] font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <FileCheck size={16} />
                  <span>Accéder à mes paramètres</span>
                </Link>
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold text-xs px-5 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  <span>Voir les conditions d'utilisation</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* Support */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#EFE6DD] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-lg text-[#2C1810] mb-1">Une question sur vos données ?</h4>
              <p className="text-xs text-[#52433B]">
                Pour toute question concernant le traitement de vos données ou pour exercer vos droits, contactez notre responsable de la vie privée.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#E86225] hover:bg-[#D0521B] px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
            >
              <Mail size={14} />
              <span>Contacter le support</span>
            </Link>
          </div>

        </main>
      </div>
    </PageTransition>
  );
}

export default Privacy;
